import warnings
# Suppress warnings
warnings.filterwarnings("ignore")
import os
import json
import re
import zipfile
import shutil
from datetime import datetime
from typing import List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from bson import ObjectId
from dotenv import load_dotenv
from pydantic import BaseModel
from sarvamai import SarvamAI

from db.mongo import sync_prescriptions, sync_schedules, sync_users

load_dotenv()

# Set Sarvam AI API key from environment
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")

# Initialize Sarvam AI client
try:
    sarvam_client = SarvamAI(
        api_subscription_key=SARVAM_API_KEY
    )
    print("[INIT] Sarvam AI Vision initialized")
except Exception as e:
    print(f"[INIT] Failed to initialize Sarvam AI client: {e}")
    sarvam_client = None

router = APIRouter()

# ==== PYDANTIC MODELS ====
class MedicineSchedule(BaseModel):
    prescription_id: str
    medicine_name: str
    dosage: str
    frequency: str
    timings: List[str]
    enabled: bool = True

class ScheduleToggle(BaseModel):
    schedule_id: str
    enabled: bool

# ==== HELPERS ====
def serialize_doc(doc):
    """Convert ObjectId to str for JSON response"""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

def extract_text_from_image_with_sarvam(image_path: str) -> str:
    """Extract text from image using Sarvam AI Vision"""
    if not sarvam_client:
        raise HTTPException(status_code=500, detail="Sarvam AI client not initialized")
    
    temp_zip_path = None
    
    try:
        print(f"[SARVAM] Creating document intelligence job for: {image_path}")
        
        # Check if file is an image (JPG, PNG, JPEG) - needs to be zipped
        file_ext = os.path.splitext(image_path)[1].lower()
        upload_path = image_path
        
        if file_ext in ['.jpg', '.jpeg', '.png']:
            # Create a ZIP file containing the image
            temp_zip_path = f"{os.path.splitext(image_path)[0]}_archive.zip"
            print(f"[SARVAM] Creating ZIP archive: {temp_zip_path}")
            
            with zipfile.ZipFile(temp_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                zipf.write(image_path, os.path.basename(image_path))
            
            upload_path = temp_zip_path
            print(f"[SARVAM] Image packaged into ZIP for upload")
        
        # Create a document intelligence job
        job = sarvam_client.document_intelligence.create_job(
            language="en-IN",  # Default to English, can be changed based on requirements
            output_format="md"  # Markdown format for easier parsing
        )
        print(f"[SARVAM] Job created: {job.job_id}")
        
        # Upload document (ZIP or PDF)
        job.upload_file(upload_path)
        print("[SARVAM] File uploaded")
        
        # Start processing
        job.start()
        print("[SARVAM] Job started")
        
        # Wait for completion
        status = job.wait_until_complete()
        print(f"[SARVAM] Job completed with state: {status.job_state}")
        
        # Download output
        output_path = f"./sarvam_output_{job.job_id}.zip"
        job.download_output(output_path)
        print(f"[SARVAM] Output saved to {output_path}")
        
        # Extract the ZIP file and read the markdown content
        extracted_text = ""
        try:
            with zipfile.ZipFile(output_path, 'r') as zip_ref:
                # Extract all files
                extract_dir = f"./sarvam_extracted_{job.job_id}"
                zip_ref.extractall(extract_dir)
                
                # Find and read markdown files
                for file_name in os.listdir(extract_dir):
                    if file_name.endswith('.md'):
                        with open(os.path.join(extract_dir, file_name), 'r', encoding='utf-8') as f:
                            extracted_text += f.read() + "\n"
                
                # Cleanup extracted directory
                shutil.rmtree(extract_dir, ignore_errors=True)
            
            # Cleanup output ZIP
            os.remove(output_path)
            
        except Exception as e:
            print(f"[SARVAM] Error extracting/reading output: {e}")
            raise
        
        print(f"[SARVAM] Extracted text length: {len(extracted_text)}")
        return extracted_text
        
    except Exception as e:
        print(f"[SARVAM] Error during text extraction: {e}")
        raise HTTPException(status_code=500, detail=f"Sarvam AI Vision extraction failed: {str(e)}")
    
    finally:
        # Clean up temporary ZIP file if created
        if temp_zip_path and os.path.exists(temp_zip_path):
            try:
                os.remove(temp_zip_path)
                print(f"[SARVAM] Cleaned up temporary ZIP file")
            except Exception as e:
                print(f"[SARVAM] Warning: Could not remove temp ZIP: {e}")


def parse_prescription_text(text: str) -> List[dict]:
    """
    Parse prescription text and extract medicine information.
    This function uses pattern matching and intelligent parsing to extract:
    - Medicine names
    - Dosage information
    - Frequency
    - Timings
    """
    medicines = []
    
    # Common patterns for prescription parsing
    lines = text.split('\n')
    
    # Non-medicine keywords to skip
    skip_keywords = [
        'prescription', 'doctor', 'patient', 'date', 'clinic', 'hospital', 
        'signature', 'age:', 'tel.', 'tel:', 'phone:', 'address:', 'dr.', 'dr ',
        'street', 'rd.', 'road', 'avenue', 'city', 'zip', 'postal',
        'r/', 'rx', '#', '---', '**', 'ms/', 'mr/', 'mrs/', 'miss/',
        'years', 'year old', 'y/o', 'yrs'
    ]
    
    valid_timings = ["morning", "afternoon", "evening", "night"]
    
    for line in lines:
        line = line.strip()
        if not line or len(line) < 3:
            continue
        
        # Remove markdown formatting
        line = re.sub(r'\*\*', '', line)
        line = re.sub(r'\*', '', line)
        line = re.sub(r'##', '', line)
        line = re.sub(r'#', '', line)
        line = line.strip()
        
        # Skip if line is too short after cleaning
        if len(line) < 3:
            continue
        
        line_lower = line.lower()
        
        # Skip lines with non-medicine keywords
        if any(keyword in line_lower for keyword in skip_keywords):
            continue
        
        # Skip lines that are just numbers or dates
        if re.match(r'^[\d\s\.\-\/]+$', line):
            continue
        
        # Skip lines that look like phone numbers
        if re.search(r'\d{3,}', line) and not re.search(r'(mg|mcg|ml|tablet|cap|g\b)', line_lower):
            continue
        
        # Look for medicine pattern with dosage (including decimals)
        # Pattern: Medicine name followed by dosage like "0.125 mg", "500mg", "2 tablets"
        medicine_match = re.search(
            r'^([A-Za-z][A-Za-z]+(?:\s+[A-Za-z]+)*?)\s+(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|tablet|cap|unit|tabs))',
            line,
            re.IGNORECASE
        )
        
        if medicine_match:
            medicine_name = medicine_match.group(1).strip()
            dosage = medicine_match.group(2).strip()
            
            # Skip if "medicine name" is actually a common word or too short
            if len(medicine_name) < 3:
                continue
            
            # Skip common non-medicine words
            if medicine_name.lower() in ['age', 'tel', 'phone', 'address', 'date', 'street', 'the', 'and', 'for']:
                continue
            
            # Parse frequency from the rest of the line
            frequency = "once a day"  # default
            timings = ["morning"]  # default
            
            # Look for frequency in the entire text after the medicine
            rest_of_text = line[medicine_match.end():].lower()
            
            # Check for "dd" (daily dosing) pattern - common in prescriptions
            if 'dd' in rest_of_text:
                # Extract number before "dd" (e.g., "1 dd 1" means 1 time daily)
                dd_match = re.search(r'(\d+)\s*dd', rest_of_text)
                if dd_match:
                    times_per_day = int(dd_match.group(1))
                    if times_per_day == 1:
                        frequency = "once a day"
                        timings = ["morning"]
                    elif times_per_day == 2:
                        frequency = "twice a day"
                        timings = ["morning", "evening"]
                    elif times_per_day == 3:
                        frequency = "thrice a day"
                        timings = ["morning", "afternoon", "evening"]
                    elif times_per_day == 4:
                        frequency = "four times a day"
                        timings = ["morning", "afternoon", "evening", "night"]
            
            # Check for standard frequency keywords
            if any(word in line_lower for word in ['thrice', 'three times', 'tid', 't.i.d', '3 times', '3x', '3 dd']):
                frequency = "thrice a day"
                timings = ["morning", "afternoon", "evening"]
            elif any(word in line_lower for word in ['twice', 'two times', 'bid', 'b.i.d', '2 times', '2x', '2 dd']):
                frequency = "twice a day"
                timings = ["morning", "evening"]
            elif any(word in line_lower for word in ['four times', 'qid', 'q.i.d', '4 times', '4x', '4 dd']):
                frequency = "four times a day"
                timings = ["morning", "afternoon", "evening", "night"]
            elif any(word in line_lower for word in ['once', 'one time', 'qd', 'q.d', 'daily', '1 time', '1x', '1 dd']):
                frequency = "once a day"
                timings = ["morning"]
            
            # Check for meal-related timing
            if 'before meal' in line_lower or 'a.c' in line_lower or 'ac' in line_lower:
                if frequency == "thrice a day":
                    timings = ["morning", "afternoon", "evening"]
            elif 'after meal' in line_lower or 'p.c' in line_lower or 'pc' in line_lower:
                if frequency == "thrice a day":
                    timings = ["morning", "afternoon", "evening"]
            
            medicines.append({
                "medicine_name": medicine_name,
                "dosage": dosage,
                "quantity": "As prescribed",
                "frequency": frequency,
                "timings": timings
            })
    
    # Remove duplicates based on medicine_name
    seen_names = set()
    unique_medicines = []
    for med in medicines:
        if med['medicine_name'] not in seen_names:
            seen_names.add(med['medicine_name'])
            unique_medicines.append(med)
    
    return unique_medicines

# ==== ROUTES ====

@router.post("/upload-prescription")
async def upload_prescription(file: UploadFile = File(...), user_id: str = Form(...)):
    """Upload prescription and create medicine schedule using Sarvam AI Vision"""
    try:
        # Verify user exists
        user = sync_users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Save uploaded file temporarily
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb") as f:
            f.write(await file.read())

        # Extract text using Sarvam AI Vision
        print(f"[UPLOAD] Extracting text from image using Sarvam AI Vision: {file_location}")
        text = extract_text_from_image_with_sarvam(file_location)
        print(f"[UPLOAD] Extracted text: {text[:200]}...")

        # Parse prescription text
        print("[UPLOAD] Parsing prescription text...")
        medicines = parse_prescription_text(text)
        print(f"[UPLOAD] Parsed {len(medicines)} medicines")

        # Convert to JSON string for storage
        structured_json = json.dumps(medicines)

        # Save prescription
        prescription_doc = {
            "user_id": user_id,
            "raw_text": text,
            "structured_data": structured_json,
            "created_at": datetime.utcnow()
        }
        prescription_id = sync_prescriptions.insert_one(prescription_doc).inserted_id

        # Create schedules
        schedule_ids = []
        valid_timings = ["morning", "afternoon", "evening", "night"]
        
        for medicine in medicines:
            if isinstance(medicine, dict):
                medicine_name = medicine.get("medicine_name", "N/A")
                timings = medicine.get("timings", [])
                
                # Skip invalid medicines
                if not medicine_name or medicine_name in ["N/A", "Unknown", "Unknown Medicine"]:
                    print(f"[SCHEDULE] Skipping - invalid medicine_name: {medicine_name}")
                    continue
                
                # Ensure timings are valid
                if not timings or not isinstance(timings, list):
                    timings = ["morning"]
                else:
                    timings = [t for t in timings if t in valid_timings]
                    if not timings:
                        timings = ["morning"]
                
                schedule_doc = {
                    "user_id": user_id,
                    "prescription_id": str(prescription_id),
                    "medicine_name": medicine_name,
                    "dosage": medicine.get("dosage", "N/A"),
                    "frequency": medicine.get("frequency", "N/A"),
                    "timings": timings,
                    "enabled": True,
                    "created_at": datetime.utcnow(),
                    "last_reminder_sent": None
                }
                schedule_id = sync_schedules.insert_one(schedule_doc).inserted_id
                schedule_ids.append(str(schedule_id))
                print(f"[SCHEDULE] Created schedule for {medicine_name} with timings: {timings}")

        # Clean up temp file
        try:
            os.remove(file_location)
        except:
            pass

        return JSONResponse({
            "success": True,
            "prescription_id": str(prescription_id),
            "schedule_ids": schedule_ids,
            "medicines": medicines,
            "message": "Prescription uploaded and schedules created successfully"
        })

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in upload_prescription: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}/schedules")
async def get_user_schedules(user_id: str):
    """Get all schedules for a user"""
    try:
        user_schedules = list(sync_schedules.find({"user_id": user_id}))
        return [serialize_doc(schedule) for schedule in user_schedules]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}/prescriptions")
async def get_user_prescriptions(user_id: str):
    """Get all prescriptions for a user"""
    try:
        user_prescriptions = list(sync_prescriptions.find({"user_id": user_id}))
        return [serialize_doc(prescription) for prescription in user_prescriptions]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/toggle-schedule")
async def toggle_schedule(toggle_data: ScheduleToggle):
    """Enable or disable a specific schedule"""
    try:
        result = sync_schedules.update_one(
            {"_id": ObjectId(toggle_data.schedule_id)},
            {"$set": {"enabled": toggle_data.enabled}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Schedule not found")
        
        status = "enabled" if toggle_data.enabled else "disabled"
        return JSONResponse({
            "success": True,
            "message": f"Schedule {status} successfully"
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/schedule/{schedule_id}")
async def delete_schedule(schedule_id: str):
    """Delete a specific schedule"""
    try:
        result = sync_schedules.delete_one({"_id": ObjectId(schedule_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Schedule not found")
        
        return JSONResponse({
            "success": True,
            "message": "Schedule deleted successfully"
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
