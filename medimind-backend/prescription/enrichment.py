"""
Medicine Information Enrichment Module
Uses LLM with web search for prescription parsing and enrichment
"""

import os
import json
from typing import List, Dict, Optional, Tuple
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")

groq_client = None
tavily_client = None

try:
    from groq import Groq
    if GROQ_API_KEY:
        groq_client = Groq(api_key=GROQ_API_KEY)
except ImportError:
    print("[ENRICHMENT] Warning: groq package not installed")

try:
    from tavily import TavilyClient
    if TAVILY_API_KEY:
        tavily_client = TavilyClient(api_key=TAVILY_API_KEY)
except ImportError:
    print("[ENRICHMENT] Warning: tavily-python package not installed")


def _truncate_ocr_text(raw_text: str, max_chars: int = 8000) -> str:
    """
    Intelligently truncate OCR text to fit within LLM token limits.
    
    Strategy:
    - If text is within limit, return as-is
    - Otherwise, take the first 5000 chars (patient info + main medicines)
      and the last 3000 chars (may contain trailing prescriptions)
    - This keeps the most medicine-relevant portions while dropping
      OCR noise, headers, disclaimers, and repeated content
    """
    if len(raw_text) <= max_chars:
        return raw_text
    
    head_size = int(max_chars * 0.6)  # 60% from start
    tail_size = max_chars - head_size  # 40% from end
    
    truncated = (
        raw_text[:head_size]
        + "\n\n... [TEXT TRUNCATED — MIDDLE SECTION OMITTED FOR BREVITY] ...\n\n"
        + raw_text[-tail_size:]
    )
    
    print(f"[PARSE] Truncated OCR text from {len(raw_text)} to ~{max_chars} chars")
    return truncated


def parse_prescription_with_groq(raw_text: str) -> List[Dict]:
    """
    Use Groq LLM to intelligently parse prescription text and extract all medicines
    This replaces manual regex parsing with AI-powered extraction
    
    Args:
        raw_text: Raw OCR text from Sarvam AI
        
    Returns:
        List of medicine dictionaries with structured data
    """
    if not groq_client:
        return []
    
    try:
        # Truncate text if too long to avoid Groq 413 errors (token limit)
        processed_text = _truncate_ocr_text(raw_text)
        
        prompt = f"""You are an expert medical prescription parser. Analyze the following prescription text extracted via OCR and identify ALL medicines.

RAW PRESCRIPTION TEXT:
```
{processed_text}
```

CRITICAL INSTRUCTIONS:
1. Extract ALL medicines from the prescription (ignore doctor info, patient details, clinic name)
2. Skip "as needed" medications (SOS, PRN, p.r.n, "if needed", "when required")
3. For each medicine, extract:
   - medicine_name: Clean name without prefix (remove SYP, TAB, CAP, INJ)
   - dosage: Amount per dose (e.g., "500mg", "5ml", "2 tablets")
   - frequency: Convert to standard format:
     * TDS/T.D.S/thrice → "thrice a day"
     * BD/BID/twice → "twice a day"
     * QID/four times → "four times a day"
     * OD/once → "once a day"
     * Q6H → "four times a day"
     * Q8H → "thrice a day"
     * Q12H → "twice a day"
   - timings: Array based on frequency:
     * once a day → ["morning"]
     * twice a day → ["morning", "evening"]
     * thrice a day → ["morning", "afternoon", "evening"]
     * four times a day → ["morning", "afternoon", "evening", "night"]

4. If dosage or frequency is unclear/missing, use "Unknown" - they will be filled later
5. Ignore duration (3d, 5d, x3d, x5d) - we only need per-dose information

RESPOND ONLY WITH VALID JSON (no markdown, no explanations):
{{
  "medicines": [
    {{
      "medicine_name": "name",
      "dosage": "amount or Unknown",
      "frequency": "frequency or Unknown",
      "timings": ["timing1", "timing2"]
    }}
  ],
  "total_found": number
}}"""

        print(f"[PARSE] Sending raw text to Groq for structured extraction...")
        
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert medical prescription parser. Extract structured medicine data from OCR text accurately. Always return valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.1,  # Very low for consistent parsing
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        # Parse Groq response
        groq_response = response.choices[0].message.content
        parsed_data = json.loads(groq_response)
        
        medicines = parsed_data.get("medicines", [])
        print(f"[PARSE] Extracted {len(medicines)} medicines")
        
        return medicines
        
    except Exception as e:
        print(f"[PARSE] Error: {str(e)}")
        return []


def detect_missing_information(medicine: Dict) -> List[str]:
    """
    Detect what critical information is missing from a medicine entry
    
    Returns:
        List of missing field names
    """
    missing_fields = []
    
    # Check for missing or placeholder dosage
    dosage = medicine.get("dosage", "")
    if not dosage or dosage in ["As prescribed", "N/A", "Unknown", "unknown", ""]:
        missing_fields.append("dosage")
    
    # Check for missing or vague frequency
    frequency = medicine.get("frequency", "")
    if not frequency or frequency in ["As prescribed", "N/A", "Unknown", "unknown", ""]:
        missing_fields.append("frequency")
    
    # Check for insufficient timings
    timings = medicine.get("timings", [])
    if not timings or not isinstance(timings, list) or len(timings) == 0:
        missing_fields.append("timings")
    
    return missing_fields


def search_medicine_information(medicine_name: str, missing_fields: List[str]) -> Optional[str]:
    """
    Search the web for medicine information to fill missing fields
    
    Args:
        medicine_name: Name of the medicine
        missing_fields: List of fields that need information
        
    Returns:
        Search results as formatted string, or None if search fails
    """
    if not tavily_client:
        return None
    
    try:
        # Construct search query
        fields_str = ", ".join(missing_fields)
        query = f"{medicine_name} medicine standard {fields_str} typical prescription information"
        
        # Perform search
        search_response = tavily_client.search(
            query=query,
            search_depth="advanced",
            max_results=3,
            include_answer=True
        )
        
        # Format results
        results = []
        
        # Add the AI-generated answer if available
        if search_response.get("answer"):
            results.append(f"Summary: {search_response['answer']}")
        
        # Add top results
        for result in search_response.get("results", [])[:3]:
            results.append(f"Source: {result.get('title', 'Unknown')}\n{result.get('content', '')}")
        
        search_context = "\n\n".join(results)
        return search_context
        
    except Exception as e:
        print(f"[ENRICHMENT] Search error: {str(e)}")
        return None


def enrich_medicine_with_llm(
    medicine: Dict, 
    missing_fields: List[str], 
    search_context: Optional[str] = None
) -> Tuple[Dict, bool]:
    """
    Use LLM to fill in missing medicine information based on web search and knowledge
    
    Args:
        medicine: Original medicine dictionary
        missing_fields: List of fields that need enrichment
        search_context: Optional web search results
        
    Returns:
        Tuple of (enriched_medicine_dict, success_flag)
    """
    if not groq_client:
        return medicine, False
    
    try:
        medicine_name = medicine.get("medicine_name", "Unknown")
        
        # Build the prompt
        prompt = f"""You are a medical information assistant. A prescription has been scanned but some information is missing.

Medicine Name: {medicine_name}
Current Information:
- Dosage: {medicine.get("dosage", "Unknown")}
- Frequency: {medicine.get("frequency", "Unknown")}
- Timings: {medicine.get("timings", [])}

Missing Fields: {", ".join(missing_fields)}
"""
        
        if search_context:
            prompt += f"\n\nREAL-TIME WEB SEARCH RESULTS (Medical Sources):\n{search_context}\n"
        
        prompt += """
Based on the web search results and standard medical practices, fill in the missing fields.

CRITICAL RULES:
1. Prioritize information from web search results (if available)
2. Only fill in standard, commonly prescribed values for this specific medicine
3. For dosage: Provide typical adult dosage (e.g., "500mg", "10mg", "5ml", "2 tablets")
4. For frequency: Use EXACTLY one of: "once a day", "twice a day", "thrice a day", "four times a day"
5. For timings: Use combinations from: "morning", "afternoon", "evening", "night"
6. If unclear or unsafe to guess, return "Unable to determine"
7. Patient safety is CRITICAL - be conservative

Respond ONLY with a JSON object:
{
  "dosage": "value or Unable to determine",
  "frequency": "value or Unable to determine",
  "timings": ["morning", "evening"] or [],
  "confidence": "high/medium/low",
  "reasoning": "Brief explanation referencing web sources if used"
}
"""
        
        # Call Groq API
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Fast and accurate Groq model
            messages=[
                {
                    "role": "system",
                    "content": "You are a medical expert that fills in missing prescription data using web search results and medical knowledge. Prioritize information from web sources when available. Always be conservative for patient safety."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,  # Lower temperature for more consistent medical info
            max_tokens=500,
            response_format={"type": "json_object"}
        )
        
        # Parse response
        llm_response = response.choices[0].message.content
        enrichment_data = json.loads(llm_response)
        
        # Create enriched medicine dictionary
        enriched_medicine = medicine.copy()
        was_enriched = False
        enrichment_notes = []
        
        # Apply enrichments only if LLM provided valid data
        if "dosage" in missing_fields and enrichment_data.get("dosage") != "Unable to determine":
            enriched_medicine["dosage"] = enrichment_data["dosage"]
            enrichment_notes.append(f"dosage: {enrichment_data['dosage']}")
            was_enriched = True
        
        if "frequency" in missing_fields and enrichment_data.get("frequency") != "Unable to determine":
            enriched_medicine["frequency"] = enrichment_data["frequency"]
            enrichment_notes.append(f"frequency: {enrichment_data['frequency']}")
            was_enriched = True
        
        if "timings" in missing_fields and enrichment_data.get("timings"):
            valid_timings = ["morning", "afternoon", "evening", "night"]
            llm_timings = [t for t in enrichment_data["timings"] if t in valid_timings]
            if llm_timings:
                enriched_medicine["timings"] = llm_timings
                enrichment_notes.append(f"timings: {', '.join(llm_timings)}")
                was_enriched = True
        
        # Add metadata about enrichment
        if was_enriched:
            enriched_medicine["enriched"] = True
            enriched_medicine["enrichment_confidence"] = enrichment_data.get("confidence", "medium")
            enriched_medicine["enrichment_reasoning"] = enrichment_data.get("reasoning", "")
            enriched_medicine["enrichment_notes"] = "AI-enriched: " + ", ".join(enrichment_notes)
        
        return enriched_medicine, was_enriched
        
    except Exception as e:
        print(f"[ENRICHMENT] LLM error: {str(e)}")
        return medicine, False


def enrich_medicines(medicines: List[Dict]) -> Tuple[List[Dict], Dict]:
    """
    Enrich medicines with missing information using Tavily web search + Groq LLM
    
    Args:
        medicines: List of medicine dictionaries from Groq parsing
        
    Returns:
        Tuple of (enriched_medicines_list, enrichment_stats)
    """
    if not groq_client:
        return medicines, {"enabled": False, "enriched_count": 0}
    
    enriched_medicines = []
    enrichment_stats = {
        "enabled": True,
        "enriched_count": 0,
        "skipped_count": 0,
        "failed_count": 0,
        "enriched_medicines": []
    }
    
    for medicine in medicines:
        medicine_name = medicine.get("medicine_name", "Unknown")
        
        # Detect missing information
        missing_fields = detect_missing_information(medicine)
        
        if not missing_fields:
            # Medicine has all required information
            enriched_medicines.append(medicine)
            enrichment_stats["skipped_count"] += 1
            continue
        
        # Search web for medicine information
        search_context = search_medicine_information(medicine_name, missing_fields)
        
        # Enrich with LLM
        enriched_medicine, was_enriched = enrich_medicine_with_llm(
            medicine, 
            missing_fields, 
            search_context
        )
        
        enriched_medicines.append(enriched_medicine)
        
        if was_enriched:
            enrichment_stats["enriched_count"] += 1
            enrichment_stats["enriched_medicines"].append({
                "name": medicine_name,
                "fields_added": missing_fields,
                "confidence": enriched_medicine.get("enrichment_confidence", "unknown")
            })
        else:
            enrichment_stats["failed_count"] += 1
    
    return enriched_medicines, enrichment_stats
