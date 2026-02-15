import warnings
# Suppress warnings
warnings.filterwarnings("ignore")
import os
import json
import re
import zipfile
import shutil
from datetime import datetime
from typing import List, Tuple
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from bson import ObjectId
from dotenv import load_dotenv
from pydantic import BaseModel
from sarvamai import SarvamAI

try:
    from PIL import Image
    import numpy as np
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("[INIT] PIL/Pillow not available - image quality validation disabled")

from db.mongo import sync_prescriptions, sync_schedules, sync_users
from prescription.enrichment import enrich_medicines, parse_prescription_with_groq

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

class ScheduleUpdate(BaseModel):
    medicine_name: str = None
    dosage: str = None
    frequency: str = None
    timings: List[str] = None

# ==== HELPERS ====
def serialize_doc(doc):
    """Convert ObjectId and datetime fields to str for JSON response"""
    if not doc:
        return doc
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc

def validate_image_quality(image_path: str) -> Tuple[bool, str, dict]:
    """Validate image quality before OCR processing"""
    if not PIL_AVAILABLE:
        return True, "Quality check skipped (PIL not available)", {}
    
    try:
        img = Image.open(image_path)
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        width, height = img.size
        file_size = os.path.getsize(image_path)
        
        quality_metrics = {
            "width": width,
            "height": height,
            "file_size_kb": round(file_size / 1024, 2),
            "aspect_ratio": round(width / height, 2) if height > 0 else 0
        }
        
        warnings = []
        
        # Check 1: Minimum resolution
        min_dimension = min(width, height)
        if min_dimension < 600:
            warnings.append(f"Low resolution ({width}x{height}). Recommended minimum: 600px. OCR accuracy may be affected.")
        
        # Check 2: Very small file size (might indicate high compression)
        if file_size < 50 * 1024:  # Less than 50KB
            warnings.append(f"Small file size ({quality_metrics['file_size_kb']}KB). Image may be heavily compressed.")
        
        # Check 3: Extreme aspect ratios
        aspect_ratio = width / height if height > 0 else 0
        if aspect_ratio > 3 or aspect_ratio < 0.3:
            warnings.append(f"Unusual aspect ratio ({quality_metrics['aspect_ratio']}). Image may be cropped or distorted.")
        
        # Check 4: Basic brightness check (if image is too dark or too bright)
        try:
            img_array = np.array(img)
            mean_brightness = np.mean(img_array)
            quality_metrics["brightness"] = round(float(mean_brightness), 2)
            
            if mean_brightness < 50:
                warnings.append(f"Image appears very dark (brightness: {quality_metrics['brightness']}). Better lighting recommended.")
            elif mean_brightness > 220:
                warnings.append(f"Image appears overexposed (brightness: {quality_metrics['brightness']}). Reduce brightness.")
        except:
            pass  # Skip brightness check if numpy/conversion fails
        
        if warnings:
            warning_message = " ".join(warnings)
            return False, warning_message, quality_metrics
        
        return True, "Image quality acceptable", quality_metrics
        
    except Exception as e:
        print(f"[QUALITY CHECK] Error validating image: {e}")
        return True, f"Quality check failed: {str(e)}", {}

def extract_text_from_image_with_sarvam(image_path: str) -> str:
    """Extract text from image using Sarvam AI Vision"""
    if not sarvam_client:
        raise HTTPException(status_code=500, detail="Sarvam AI client not initialized")
    
    temp_zip_path = None
    
    try:
        print(f"[SARVAM] Creating document intelligence job for: {image_path}")
        
        # Check if file needs to be zipped
        file_ext = os.path.splitext(image_path)[1].lower()
        upload_path = image_path
        
        if file_ext in ['.jpg', '.jpeg', '.png']:
            # Create a ZIP file containing the image
            temp_zip_path = f"{os.path.splitext(image_path)[0]}_archive.zip"
            print(f"[SARVAM] Creating ZIP archive: {temp_zip_path}")
            
            with zipfile.ZipFile(temp_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                zipf.write(image_path, os.path.basename(image_path))
            
            upload_path = temp_zip_path
        
        # Create document intelligence job
        job = sarvam_client.document_intelligence.create_job(
            language="en-IN",
            output_format="md"  # Markdown format for easier parsing
        )
        print(f"[SARVAM] Job created: {job.job_id}")
        
        # Upload and process
        job.upload_file(upload_path)
        job.start()
        status = job.wait_until_complete()
        
        # Download output
        output_path = f"./sarvam_output_{job.job_id}.zip"
        job.download_output(output_path)
        
        # Extract the ZIP file and read the markdown content
        extracted_text = ""
        try:
            with zipfile.ZipFile(output_path, 'r') as zip_ref:
                # Extract all files
                extract_dir = f"./sarvam_extracted_{job.job_id}"
                zip_ref.extractall(extract_dir)
                
                # Read markdown files
                for file_name in os.listdir(extract_dir):
                    if file_name.endswith('.md'):
                        with open(os.path.join(extract_dir, file_name), 'r', encoding='utf-8') as f:
                            extracted_text += f.read() + "\n"
                
                # Cleanup extracted directory
                shutil.rmtree(extract_dir, ignore_errors=True)
        except Exception as e:
            print(f"[SARVAM] Error extracting output: {e}")
        finally:
            # Cleanup output ZIP
            if os.path.exists(output_path):
                os.remove(output_path)
        
        # Clean up temporary ZIP file if created
        if temp_zip_path and os.path.exists(temp_zip_path):
            try:
                os.remove(temp_zip_path)
            except Exception as e:
                print(f"[SARVAM] Error cleaning up temp ZIP: {e}")
        
        return extracted_text
    
    except Exception as e:
        print(f"[SARVAM] Error extracting text: {e}")
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")


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

        # Validate image quality before OCR
        quality_valid, quality_message, quality_metrics = validate_image_quality(file_location)
        quality_warnings = []
        
        if not quality_valid:
            quality_warnings.append(quality_message)

        # Extract text using Sarvam AI Vision
        text = extract_text_from_image_with_sarvam(file_location)
        print(f"[OCR] Extracted {len(text)} characters")

        # Parse prescription using Groq LLM
        medicines = parse_prescription_with_groq(text)
        print(f"[PARSE] Found {len(medicines)} medicines")

        # Enrich with LLM + web search
        enriched_medicines, enrichment_stats = enrich_medicines(medicines)
        print(f"[ENRICHMENT] {enrichment_stats['enriched_count']} enriched, {enrichment_stats['skipped_count']} complete")
        
        # Use enriched medicines for storage and scheduling
        medicines = enriched_medicines

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

        # Clean up temp file
        try:
            os.remove(file_location)
        except:
            pass

        
            error_response = {
                "success": False,
                "prescription_id": str(prescription_id),
                "schedule_ids": [],
                "medicines": [],
                "message": "No medicines detected. This may be due to poor image quality, unclear text, or non-standard prescription format. Please try uploading a clearer image or contact support.",
                "raw_text_preview": text[:300] if text else "No text extracted",
                "suggestions": [
                    "Ensure the image is clear and well-lit",
                    "Make sure the prescription text is readable",
                    "Try taking the photo straight-on (not at an angle)",
                    "Check that medicine names and dosages are visible"
                ]
            }
            
            # Add quality warnings if any
            if quality_warnings:
                error_response["quality_warnings"] = quality_warnings
                error_response["quality_metrics"] = quality_metrics
            
            return JSONResponse(error_response, status_code=400)
        
        # Build success message with warnings if any
        message = f"Prescription uploaded successfully. {len(medicines)} medicine(s) extracted and {len(schedule_ids)} schedule(s) created."
        if len(medicines) != len(schedule_ids):
            message += f" Note: Some medicines were skipped (e.g., 'as needed' medications)."
        
        # Add enrichment information to message
        if enrichment_stats.get("enriched_count", 0) > 0:
            message += f" {enrichment_stats['enriched_count']} medicine(s) enhanced with AI-powered information."

        response_data = {
            "success": True,
            "prescription_id": str(prescription_id),
            "schedule_ids": schedule_ids,
            "medicines": medicines,
            "message": message,
            "schedules_created": len(schedule_ids),
            "medicines_detected": len(medicines),
            "enrichment_stats": enrichment_stats
        }
        
        # Add quality warnings if any
        if quality_warnings:
            response_data["quality_warnings"] = quality_warnings
            response_data["quality_metrics"] = quality_metrics

        return JSONResponse(response_data)

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


@router.put("/schedule/{schedule_id}")
async def update_schedule(schedule_id: str, update_data: ScheduleUpdate):
    """Update a specific schedule's fields"""
    try:
        # Build update dict from provided (non-None) fields
        update_fields = {}
        
        if update_data.medicine_name is not None:
            update_fields["medicine_name"] = update_data.medicine_name.strip()
        
        if update_data.dosage is not None:
            update_fields["dosage"] = update_data.dosage.strip()
        
        if update_data.frequency is not None:
            update_fields["frequency"] = update_data.frequency.strip()
        
        if update_data.timings is not None:
            valid_timings = ["morning", "afternoon", "evening", "night"]
            cleaned_timings = [t for t in update_data.timings if t in valid_timings]
            if not cleaned_timings:
                raise HTTPException(
                    status_code=400,
                    detail="At least one valid timing is required (morning, afternoon, evening, night)"
                )
            update_fields["timings"] = cleaned_timings
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_fields["updated_at"] = datetime.utcnow()
        
        result = sync_schedules.update_one(
            {"_id": ObjectId(schedule_id)},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Schedule not found")
        
        # Return the updated document
        updated_doc = sync_schedules.find_one({"_id": ObjectId(schedule_id)})
        
        return JSONResponse({
            "success": True,
            "message": "Schedule updated successfully",
            "schedule": serialize_doc(updated_doc)
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

