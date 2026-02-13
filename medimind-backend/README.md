# MediMind Backend - System Architecture & Workflow

## 🏗️ System Overview

MediMind is an AI-powered prescription management system that automates medication reminders through OCR, LLM parsing, and scheduled email notifications.

---

## 🔄 Complete Workflow

### **Phase 1: Prescription Upload**
```
User → Frontend (Dashboard) → Backend API → Temporary Storage
```

**Endpoint:** `POST /api/upload-prescription`

**Input:**
- `file`: Prescription image (JPG/PNG)
- `user_id`: MongoDB ObjectId

**Code:**
```python
@router.post("/upload-prescription")
async def upload_prescription(file: UploadFile, user_id: str):
    # Save temporarily
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb") as f:
        f.write(await file.read())
```

---

### **Phase 2: OCR Text Extraction**

**Technology:** EasyOCR 1.7.2 (Multi-language support)

**Process:**
```python
def extract_text_from_image(image_path: str) -> str:
    results = reader.readtext(image_path, detail=0)
    text = " ".join(results)
    return text
```

**Example Input:**
```
[Prescription Image with handwritten text]
```

**Example Output:**
```
"Amoxicillin 250mg tablets twice afternoon"
```

---

### **Phase 3: LLM Structured Extraction**

**Technology:** OpenRouter API + OpenAI GPT-oss-120b

**Process:**
```python
def call_openrouter_llm(text: str):
    prompt = """
    You are a medical prescription parser.
    Extract structured data from the prescription text below.
    Required fields:
    - medicine_name
    - dosage (how many tablets/capsules per time)
    - quantity (total prescribed)
    - frequency (times per day or instructions)
    - timings (morning, afternoon, evening, night)

    Return output as strict JSON list of objects.
    """
    
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000,
        temperature=0.1
    )
    
    return response.choices[0].message.content
```

**Example Input:**
```
"Amoxicillin 250mg tablets twice afternoon"
```

**Example Output:**
```json
[
  {
    "medicine_name": "Amoxicillin",
    "dosage": "1 tablet",
    "quantity": "10",
    "frequency": "twice a day",
    "timings": ["afternoon"]
  }
]
```

---

### **Phase 3.5: LLM-Powered Medicine Enrichment** 🤖✨

**NEW FEATURE:** Automatically fills in missing prescription information using AI + real-time web search.

**Technology:** 
- Groq LLaMA 3.3 70B (Ultra-fast LLM reasoning)
- Tavily Search API (Real-time web search for medical information)

**When It Runs:**
After OCR parsing but before saving to database, the system:
1. Detects missing/incomplete fields (dosage, frequency, timings)
2. Searches the web for standard medicine information
3. Uses LLM to intelligently fill in missing data based on medical knowledge

**Process Flow:**

```python
# prescription/enrichment.py

def enrich_medicines(medicines: List[Dict]) -> Tuple[List[Dict], Dict]:
    """
    Step 1: Detect missing information
    """
    for medicine in medicines:
        missing_fields = detect_missing_information(medicine)
        # Example: ["dosage", "frequency"] if these are "As prescribed"
        
        if missing_fields:
            # Step 2: Web search for medicine information
            search_context = search_medicine_information(
                medicine_name="Amoxicillin",
                missing_fields=["dosage", "frequency"]
            )
            # Returns: "Amoxicillin standard adult dose is 250-500mg 3 times daily..."
            
            # Step 3: LLM enrichment with context
            enriched_medicine, success = enrich_medicine_with_llm(
                medicine=medicine,
                missing_fields=missing_fields,
                search_context=search_context
            )
```

**LLM Prompt Example:**

```python
prompt = """
You are a medical information assistant. A prescription has been scanned but some information is missing.

Medicine Name: Amoxicillin
Current Information:
- Dosage: As prescribed
- Frequency: Unknown
- Timings: []

Missing Fields: dosage, frequency

Web Search Results:
Amoxicillin is commonly prescribed at 250-500mg three times daily for adults...

Based on standard medical practices, provide typical values for missing fields.

IMPORTANT RULES:
1. Only provide standard, commonly prescribed values
2. For dosage: Provide typical adult dosage (e.g., "500mg", "250mg")
3. For frequency: Use: "once a day", "twice a day", "thrice a day"
4. For timings: Combinations of: "morning", "afternoon", "evening", "night"
5. If uncertain, return "Unable to determine"
6. Be conservative - patient safety is critical

Respond ONLY with JSON:
{
  "dosage": "250mg",
  "frequency": "thrice a day",
  "timings": ["morning", "afternoon", "evening"],
  "confidence": "high",
  "reasoning": "Standard adult dose for common infections"
}
"""
```

**Example Enrichment:**

**Before Enrichment:**
```json
{
  "medicine_name": "Amoxicillin",
  "dosage": "As prescribed",
  "frequency": "Unknown",
  "timings": []
}
```

**After Enrichment:**
```json
{
  "medicine_name": "Amoxicillin",
  "dosage": "250mg",
  "frequency": "thrice a day",
  "timings": ["morning", "afternoon", "evening"],
  "enriched": true,
  "enrichment_confidence": "high",
  "enrichment_reasoning": "Standard adult dose for common bacterial infections",
  "enrichment_notes": "AI-enriched: dosage: 250mg, frequency: thrice a day, timings: morning, afternoon, evening"
}
```

**Safety Features:**
- ✅ Only fills in standard, commonly prescribed values
- ✅ Uses real-time web search for up-to-date medical information
- ✅ Includes confidence levels (high/medium/low)
- ✅ Provides reasoning for transparency
- ✅ Returns "Unable to determine" if uncertain
- ✅ Conservative approach prioritizing patient safety

**Enrichment Statistics Returned:**
```json
{
  "enrichment_stats": {
    "enabled": true,
    "total_medicines": 3,
    "enriched_count": 2,
    "skipped_count": 1,
    "failed_count": 0,
    "enriched_medicines": [
      {
        "name": "Amoxicillin",
        "fields_added": ["dosage", "frequency", "timings"],
        "confidence": "high"
      }
    ]
  }
}
```

**Configuration:**

Add to `.env`:
```bash
# Required for LLM enrichment
GROQ_API_KEY=gsk-your-groq-key
TAVILY_API_KEY=tvly-your-tavily-key

# Optional feature flags
ENABLE_LLM_ENRICHMENT=true
ENABLE_WEB_SEARCH=true
```

---

### **Phase 4: Database Storage**

**Technology:** MongoDB Atlas

#### **Collections:**

**1. Prescriptions Collection:**
```python
prescription_doc = {
    "user_id": "673854abc123456789",
    "raw_text": "Amoxicillin 250mg tablets twice afternoon",
    "structured_data": "[{...}]",  # LLM JSON output
    "created_at": datetime.utcnow()
}
prescription_id = sync_prescriptions.insert_one(prescription_doc).inserted_id
```

**2. Schedules Collection:**
```python
schedule_doc = {
    "user_id": "673854abc123456789",
    "prescription_id": "673854def987654321",
    "medicine_name": "Amoxicillin",
    "dosage": "1 tablet",
    "frequency": "twice a day",
    "timings": ["afternoon"],  # ← Used by scheduler
    "enabled": True,            # ← Can be toggled by user
    "created_at": datetime.utcnow(),
    "last_reminder_sent": None
}
schedule_id = sync_schedules.insert_one(schedule_doc).inserted_id
```

**3. Users Collection:**
```python
user_doc = {
    "_id": ObjectId("673854abc123456789"),
    "email": "user@example.com",
    "password_hash": "bcrypt_hash_here",
    "created_at": datetime.utcnow()
}
```

---

### **Phase 5: Scheduler Initialization**

**Technology:** APScheduler (Background Scheduler)

**Startup:**
```python
# app.py
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("[APP] Starting MediMind Backend API...")
    start_scheduler()
    yield
    # Shutdown
    print("[APP] Shutting down...")
    stop_scheduler()

app = FastAPI(
    title="MediMind Backend API",
    version="1.0.0",
    lifespan=lifespan
)
```

**Cron Jobs Setup:**
```python
# scheduler/reminder_scheduler.py
def start_scheduler():
    # Morning: 8 AM
    scheduler.add_job(
        check_and_send_reminders,
        CronTrigger(hour=8, minute=0),
        id="morning_reminder",
        name="Morning Medication Reminder"
    )
    
    # Afternoon: 1 PM
    scheduler.add_job(
        check_and_send_reminders,
        CronTrigger(hour=13, minute=0),
        id="afternoon_reminder",
        name="Afternoon Medication Reminder"
    )
    
    # Evening: 6 PM
    scheduler.add_job(
        check_and_send_reminders,
        CronTrigger(hour=18, minute=0),
        id="evening_reminder",
        name="Evening Medication Reminder"
    )
    
    # Night: 9 PM
    scheduler.add_job(
        check_and_send_reminders,
        CronTrigger(hour=21, minute=0),
        id="night_reminder",
        name="Night Medication Reminder"
    )
    
    scheduler.start()
    print("[SCHEDULER] Started with 4 daily reminder checks")
```

---

### **Phase 6: Alert Execution**

**Trigger:** Runs automatically at 8 AM, 1 PM, 6 PM, 9 PM

**Process:**
```python
def check_and_send_reminders():
    print(f"[SCHEDULER] Running reminder check at {datetime.now()}")
    
    # Step 1: Determine current time period
    current_hour = datetime.now().hour
    
    if 6 <= current_hour < 12:
        timing_period = "morning"
    elif 12 <= current_hour < 17:
        timing_period = "afternoon"
    elif 17 <= current_hour < 21:
        timing_period = "evening"
    else:
        timing_period = "night"
    
    print(f"[SCHEDULER] Current timing period: {timing_period}")
    
    # Step 2: Query enabled schedules matching current time
    schedules = list(sync_schedules.find({
        "enabled": True,
        "timings": timing_period
    }))
    
    print(f"[SCHEDULER] Found {len(schedules)} schedules for {timing_period}")
    
    # Step 3: Send email for each schedule
    for schedule in schedules:
        # Get user email
        user = sync_users.find_one({"_id": ObjectId(schedule["user_id"])})
        if not user or "email" not in user:
            continue
        
        # Send reminder
        success = send_medication_reminder(
            to_email=user["email"],
            medicine_name=schedule["medicine_name"],
            dosage=schedule["dosage"],
            timing=timing_period
        )
        
        if success:
            # Update timestamp
            sync_schedules.update_one(
                {"_id": schedule["_id"]},
                {"$set": {"last_reminder_sent": datetime.utcnow()}}
            )
            print(f"[SCHEDULER] Sent reminder for {schedule['medicine_name']}")
```

---

### **Phase 7: Email Delivery**

**Technology:** Gmail SMTP with TLS

**HTML Email Template:**
```python
def send_medication_reminder(to_email: str, medicine_name: str, dosage: str, timing: str):
    subject = f"💊 MediMind Reminder: {medicine_name}"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 30px; 
                text-align: center; 
                border-radius: 10px 10px 0 0; 
            }}
            .medicine-card {{ 
                background: white; 
                padding: 20px; 
                border-left: 4px solid #667eea; 
                margin: 20px 0; 
                border-radius: 5px; 
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="font-size: 48px;">💊</div>
                <h1>Medication Reminder</h1>
            </div>
            <div class="medicine-card">
                <p><strong>Medicine:</strong> {medicine_name}</p>
                <p><strong>Dosage:</strong> {dosage}</p>
                <p><strong>Time:</strong> {timing.capitalize()}</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    msg = MIMEMultipart("alternative")
    msg["From"] = EMAIL_FROM
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))
    
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.send_message(msg)
    
    return True
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER INTERACTION                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                   ┌─────────────────┐
                   │  Frontend React │
                   │   Dashboard UI  │
                   │  File Upload    │
                   └────────┬────────┘
                            │ POST /api/upload-prescription
                            ▼
              ┌──────────────────────────────┐
              │      FastAPI Backend         │
              │   (app.py + routers)         │
              └──────────┬───────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌────────────────┐ ┌──────────┐ ┌──────────────┐
│   EasyOCR      │ │ OpenAI   │ │   MongoDB    │
│   Text Extract │ │   LLM    │ │   Storage    │
│   Multi-lang   │ │ GPT-120b │ │   Atlas DB   │
└────────────────┘ └──────────┘ └──────┬───────┘
                                        │
                         ┌──────────────┼──────────────┐
                         │              │              │
                         ▼              ▼              ▼
                  ┏━━━━━━━━━━━┓  ┏━━━━━━━━━━┓  ┏━━━━━━━┓
                  ┃Prescriptions┃ ┃Schedules ┃  ┃ Users ┃
                  ┃ Collection ┃  ┃Collection┃  ┃  Col  ┃
                  ┗━━━━━━━━━━━┛  ┗━━━━┬━━━━━┛  ┗━━━━━━━┛
                                      │
                                      │ Query: enabled=true
                                      │        timings=current
                                      ▼
                           ┌──────────────────────┐
                           │   APScheduler        │
                           │   Background Jobs    │
                           │                      │
                           │  ⏰ 8:00 AM  Morning │
                           │  ⏰ 1:00 PM  Afternoon│
                           │  ⏰ 6:00 PM  Evening │
                           │  ⏰ 9:00 PM  Night   │
                           └──────────┬───────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │  Gmail SMTP (TLS)    │
                           │  notification/       │
                           │  service.py          │
                           │                      │
                           │  📧 HTML Email       │
                           │  💊 Reminder Card    │
                           └──────────┬───────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │   USER EMAIL INBOX   │
                           │   ✉️ Reminder        │
                           └──────────────────────┘
```

---

## 🗂️ Project Structure

```
medimind-backend/
├── app.py                      # FastAPI main application
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables
│
├── auth/
│   ├── __init__.py
│   ├── routes.py              # Signup, login, logout, /me
│   ├── hash.py                # bcrypt password hashing
│   └── sessions.py            # In-memory session storage
│
├── db/
│   ├── __init__.py
│   └── mongo.py               # MongoDB sync/async clients
│
├── prescription/
│   ├── __init__.py
│   └── routes.py              # Upload, OCR, LLM, schedules
│
├── notification/
│   ├── __init__.py
│   └── service.py             # Email sending with SMTP
│
└── scheduler/
    ├── __init__.py
    ├── reminder_scheduler.py  # APScheduler cron jobs
    └── test_reminder.py       # Manual testing script
```

---

## 🔑 Key Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Web Framework** | FastAPI | 0.115.5 | REST API server |
| **Database** | MongoDB Atlas | Cloud | Document storage |
| **OCR Engine** | EasyOCR | 1.7.2 | Image text extraction |
| **AI Model** | OpenAI GPT-oss-120b | via OpenRouter | Text parsing |
| **Scheduler** | APScheduler | 3.10+ | Cron-like jobs |
| **Email** | Gmail SMTP | TLS | Notification delivery |
| **Auth** | bcrypt | 4.0.1 | Password hashing |
| **Session** | In-memory Dict | Custom | User sessions |

---

## 🚀 Installation & Setup

### **1. Install Dependencies**

```bash
cd medimind-backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### **2. Configure Gmail App Password**

1. Enable 2-Factor Authentication on Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Create app password for "MediMind"
4. Copy 16-character password to `.env`

### **3. Start Backend Server**

```bash
uvicorn app:app --reload
```

**Server runs on:** http://localhost:8000

**API Documentation:** http://localhost:8000/docs

---

## 📡 API Endpoints

### **Authentication**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Create new user account |
| POST | `/auth/login` | Login and get session cookie |
| POST | `/auth/logout` | Clear session |
| GET | `/auth/me` | Get current user info |

### **Prescriptions**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload-prescription` | Upload & process prescription |
| GET | `/api/user/{user_id}/schedules` | Get user's medication schedules |
| GET | `/api/user/{user_id}/prescriptions` | Get user's prescription history |
| POST | `/api/toggle-schedule` | Enable/disable schedule |
| DELETE | `/api/schedule/{schedule_id}` | Delete schedule |

### **Health Check**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | System status + scheduler info |

---

## 🧪 Testing

### **Manual Email Test**

```bash
python scheduler/test_reminder.py
```

**Options:**
1. Send test email (single)
2. Run scheduler check (current time)
3. Both

### **Health Check**

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "scheduler": {
    "running": true,
    "jobs": [
      {"id": "morning_reminder", "next_run": "2025-11-17 08:00:00"},
      {"id": "afternoon_reminder", "next_run": "2025-11-17 13:00:00"}
    ]
  }
}
```

---

## 🔐 Security Features

### **Password Security**
- bcrypt hashing with 72-byte truncation
- Salt rounds: 12 (default)

### **Session Management**
- HTTP-only cookies
- 7-day expiration
- In-memory storage (production: Redis)

### **API Security**
- CORS whitelist
- Session validation on protected routes
- User isolation in database queries

---

## 📅 Reminder Schedule

| Time | Period | Trigger |
|------|--------|---------|
| 8:00 AM | Morning | Medicines with `"morning"` in timings |
| 1:00 PM | Afternoon | Medicines with `"afternoon"` in timings |
| 6:00 PM | Evening | Medicines with `"evening"` in timings |
| 9:00 PM | Night | Medicines with `"night"` in timings |

**Example:**
```json
{
  "medicine_name": "Aspirin",
  "dosage": "75mg",
  "timings": ["morning", "evening"]
}
```
→ User receives 2 emails daily: at 8 AM and 6 PM

---

## 🐛 Troubleshooting

### **Email Not Sending (Error 535/534)**
```
Error: Username and Password not accepted
```
**Solution:** Use Gmail App Password, not regular password

### **Scheduler Not Running**
```
[SCHEDULER] Jobs: []
```
**Solution:** Restart backend, check `/health` endpoint

### **OCR Fails**
```
EasyOCR: CUDA not available
```
**Solution:** Normal - runs on CPU (slower but works)

### **Database Connection Error**
```
database: "error: connection refused"
```
**Solution:** Check MongoDB URL in `.env`, verify IP whitelist on Atlas

---

## 🎯 User Flow Example

**Day 1 - 10:00 PM:**
```
1. User uploads prescription image
2. OCR extracts: "Metformin 500mg twice daily morning evening"
3. LLM parses to JSON
4. Schedule saved with timings: ["morning", "evening"]
```

**Day 2 - 8:00 AM:**
```
1. Scheduler runs morning check
2. Finds Metformin schedule (enabled=true, timings contains "morning")
3. Sends email: "💊 Take Metformin 500mg - Morning"
```

**Day 2 - 6:00 PM:**
```
1. Scheduler runs evening check
2. Finds same Metformin schedule
3. Sends email: "💊 Take Metformin 500mg - Evening"
```

**Day 3+:**
```
Continues daily at 8 AM and 6 PM until user disables schedule
```

---

## 📈 Future Enhancements

- [ ] Push notifications (Firebase)
- [ ] SMS reminders (Twilio)
- [ ] Redis session storage for production
- [ ] Prescription image history storage
- [ ] Multi-language OCR improvements
- [ ] Dosage tracking and analytics
- [ ] Pharmacy integration
- [ ] Doctor notes parsing

---

## 📝 License

MIT License - MediMind Backend System

---

## 👥 Contributors

Built by the MediMind Team

**Contact:** karthikrayaprolu13@gmail.com

---

## 🔗 Related Documentation

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [OpenRouter API](https://openrouter.ai/)
- [EasyOCR](https://github.com/JaidedAI/EasyOCR)
- [APScheduler](https://apscheduler.readthedocs.io/)
