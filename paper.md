# MediMind: AI-Powered Prescription Management and Medication Reminder System

## Abstract

MediMind is an intelligent healthcare application that leverages Optical Character Recognition (OCR), Large Language Model (LLM) parsing, and automated scheduling to transform traditional prescription management into a seamless, user-friendly experience. The system enables users to upload prescription images, automatically extracts medication information, creates personalized reminder schedules, and delivers timely notifications via email and mobile push notifications. Built with modern web technologies and deployed on both web and mobile platforms, MediMind addresses the critical challenge of medication adherence through intelligent automation.

**Keywords:** Healthcare Technology, OCR, LLM, Medication Adherence, Push Notifications, Firebase Cloud Messaging, FastAPI, React, Capacitor

---

## 1. Introduction

### 1.1 Background

Medication non-adherence remains a significant challenge in healthcare, leading to increased hospitalizations, disease progression, and healthcare costs. Studies indicate that approximately 50% of patients do not take medications as prescribed. Traditional methods of medication management, such as manual pill organizers and written schedules, are prone to human error and require significant cognitive effort.

### 1.2 Problem Statement

Patients face several challenges in managing their medications:
- **Complex Prescription Information**: Medical prescriptions contain technical terminology, dosage instructions, and timing requirements that can be difficult to interpret
- **Manual Schedule Management**: Creating and maintaining medication schedules is time-consuming and error-prone
- **Reminder Dependency**: Patients need reliable, timely reminders across multiple devices
- **Accessibility**: Traditional prescription documents can be lost, damaged, or difficult to read

### 1.3 Proposed Solution

MediMind addresses these challenges through:
1. **Automated Prescription Parsing**: OCR technology extracts text from prescription images
2. **AI-Powered Data Extraction**: LLM models parse unstructured prescription text into structured medication data
3. **Intelligent Scheduling**: Automatic creation of medication reminder schedules based on timing and frequency
4. **Multi-Channel Notifications**: Email and mobile push notifications ensure timely medication reminders
5. **Cross-Platform Accessibility**: Web and mobile applications provide seamless access across devices

---

## 2. System Architecture

### 2.1 Technology Stack

#### 2.1.1 Frontend Technologies
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.0.7 (fast development and optimized production builds)
- **UI Library**: shadcn-ui with Radix UI primitives
- **Styling**: Tailwind CSS 3.4.17 for responsive design
- **Mobile Wrapper**: Capacitor 7.4.4 for native mobile deployment
- **Animations**: Framer Motion for smooth UI transitions
- **State Management**: React Context API with custom hooks
- **HTTP Client**: Native Fetch API with session token management

#### 2.1.2 Backend Technologies
- **Framework**: FastAPI (Python) - high-performance async web framework
- **Database**: MongoDB with PyMongo for user data and prescriptions
- **Session Management**: Redis for distributed session storage
- **OCR Engine**: EasyOCR 1.7.2 with English language support
- **LLM Integration**: OpenRouter API with DeepSeek R1-T2 Chimera model
- **Scheduling**: APScheduler for background reminder tasks
- **Email Service**: SMTP with Gmail integration
- **Push Notifications**: Firebase Cloud Messaging (FCM) via Firebase Admin SDK
- **Authentication**: Session-based auth with bcrypt password hashing

#### 2.1.3 Mobile Technologies
- **Platform**: Capacitor WebView wrapper
- **Push Notifications**: @capacitor/push-notifications 7.0.3
- **Deployment**: Android APK/AAB via Android Studio
- **Native Features**: FCM token registration, notification channels

### 2.2 System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │   Web Browser    │              │  Mobile App      │        │
│  │   (React + Vite) │              │  (Capacitor)     │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
└───────────┼────────────────────────────────┼──────────────────┘
            │                                │
            └────────────┬───────────────────┘
                         │ HTTP/HTTPS (REST API)
            ┌────────────▼───────────────────────────────────────┐
            │              API Gateway Layer                      │
            │          FastAPI + CORS Middleware                  │
            │     (Session & Authorization Header Auth)          │
            └────────────┬───────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────────┐
        │                │                    │
┌───────▼────────┐  ┌────▼─────────┐  ┌──────▼──────────┐
│  Auth Service  │  │ Prescription │  │   Notification  │
│                │  │   Service    │  │    Service      │
│ - Login/Signup │  │ - OCR        │  │ - Email (SMTP)  │
│ - Sessions     │  │ - LLM Parse  │  │ - Push (FCM)    │
│ - FCM Tokens   │  │ - Schedules  │  │                 │
└───────┬────────┘  └────┬─────────┘  └──────┬──────────┘
        │                │                    │
        └────────────────┼────────────────────┘
                         │
        ┌────────────────┼────────────────────────┐
        │                │                        │
┌───────▼────────┐  ┌────▼─────────┐  ┌──────────▼──────────┐
│   MongoDB      │  │    Redis     │  │  Firebase Admin SDK │
│                │  │              │  │                      │
│ - Users        │  │ - Sessions   │  │ - FCM Messaging     │
│ - Prescriptions│  │ - TTL: 7 days│  │ - Token Validation  │
│ - Schedules    │  │              │  │                      │
└────────────────┘  └──────────────┘  └─────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
┌───────▼────────┐              ┌─────────▼────────┐
│  APScheduler   │              │   EasyOCR Engine │
│                │              │                  │
│ - Cron Jobs    │              │ - Text Extract   │
│ - 4 Daily Runs │              │ - Multi-language │
│ - 8AM/1PM/6PM/9PM             └──────────────────┘
└────────────────┘
```

---

## 3. Detailed Workflow

### 3.1 User Authentication Flow

**Step 1: User Registration**
```
User Input → Frontend Validation → POST /auth/signup
    ↓
Backend receives: { email, password, fullName }
    ↓
Password hashing with bcrypt (salt rounds: 12)
    ↓
MongoDB insertion: users collection
    ↓
Redis session creation (TTL: 7 days)
    ↓
Response: { user_id, session_id, email }
    ↓
Frontend stores session_id in localStorage
    ↓
Push notification registration (mobile only)
```

**Step 2: Authentication Methods**
- **Web**: Session cookie + session_id in response body
- **Mobile**: Authorization Bearer token in headers
- **Session Storage**: Redis with 7-day expiration
- **CORS Configuration**: `allow_origins=["*"]` with `allow_credentials=False` for mobile compatibility

### 3.2 Prescription Upload and Processing Pipeline

#### Phase 1: File Upload
```javascript
// Frontend: Dashboard Component
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId);
  
  const response = await prescriptionApi.uploadPrescription(file, userId);
  // Returns: { prescription_id, schedule_ids, medicines }
}
```

**Backend Endpoint**: `POST /api/upload-prescription`
- **Input**: Multipart form data (image file + user_id)
- **Supported Formats**: JPG, PNG, JPEG
- **Temporary Storage**: Local filesystem (`temp_{filename}`)
- **Size Limit**: Configurable via FastAPI settings

#### Phase 2: OCR Text Extraction
```python
def extract_text_from_image(image_path: str) -> str:
    """Extract text using EasyOCR"""
    results = reader.readtext(image_path, detail=0)
    text = " ".join(results)
    return text
```

**Technology**: EasyOCR 1.7.2
- **Language Model**: English (["en"])
- **Processing**: CPU-based inference
- **Output**: Raw concatenated text string
- **Error Handling**: Graceful fallback for unreadable images

**Example**:
- **Input Image**: Prescription with "Amoxicillin 250mg tablets twice daily afternoon evening"
- **OCR Output**: "Amoxicillin 250mg tablets twice afternoon evening"

#### Phase 3: LLM Structured Parsing

**Technology**: OpenRouter API with DeepSeek R1-T2 Chimera model

**Prompt Engineering**:
```python
prompt = """
You are an expert medical prescription parsing engine with 20+ years of experience.
Extract structured JSON data from prescription text.

REQUIRED OUTPUT FORMAT (STRICT):
[
  {
    "medicine_name": "...",
    "dosage": "...",
    "quantity": "...",
    "frequency": "...",
    "timings": ["morning", "afternoon", "evening", "night"]
  }
]

FIELD RULES:
1. If ANY field is missing → use "N/A"
2. "timings" must be array of: ["morning", "afternoon", "evening", "night"]
3. If timing unclear → default to ["morning"]

FREQUENCY INTERPRETATION:
- "t.i.d." or "tid" → "thrice a day"
- "b.i.d." or "bid" → "twice a day"
- "q.i.d." or "qid" → "four times a day"
- "q.d." or "qd" → "once a day"
- "before meals" → "before food"
- "after meals" → "after food"
- "at bedtime" or "h.s." → "at night"

Prescription Text:
{extracted_text}
"""
```

**API Configuration**:
- **Base URL**: `https://openrouter.ai/api/v1`
- **Model**: `tngtech/deepseek-r1t2-chimera:free`
- **Max Tokens**: 1000
- **Temperature**: 0.1 (low for deterministic output)
- **Fallback**: Multiple retry attempts with error logging

**Example Transformation**:

Input (OCR Text):
```
Amoxicillin 250mg tablets twice afternoon evening
Paracetamol 500mg t.i.d. before meals
```

Output (Structured JSON):
```json
[
  {
    "medicine_name": "Amoxicillin",
    "dosage": "250mg",
    "quantity": "N/A",
    "frequency": "twice a day",
    "timings": ["afternoon", "evening"]
  },
  {
    "medicine_name": "Paracetamol",
    "dosage": "500mg",
    "quantity": "N/A",
    "frequency": "thrice a day",
    "timings": ["morning", "afternoon", "evening"]
  }
]
```

#### Phase 4: Database Storage

**Collections**:

1. **Prescriptions Collection**:
```javascript
{
  _id: ObjectId("..."),
  user_id: "user_object_id",
  raw_text: "Extracted OCR text...",
  structured_data: "[{...}]", // JSON string
  created_at: ISODate("2025-12-18T10:30:00Z"),
  file_name: "prescription_image.jpg"
}
```

2. **Schedules Collection**:
```javascript
{
  _id: ObjectId("..."),
  user_id: "user_object_id",
  prescription_id: "prescription_object_id",
  medicine_name: "Amoxicillin",
  dosage: "250mg",
  frequency: "twice a day",
  timings: ["afternoon", "evening"],
  enabled: true,
  created_at: ISODate("2025-12-18T10:30:00Z"),
  last_reminder_sent: null
}
```

#### Phase 5: Cleanup
```python
# Remove temporary file after processing
if os.path.exists(file_location):
    os.remove(file_location)
```

### 3.3 Medication Reminder System

#### Scheduler Architecture

**Technology**: APScheduler with BackgroundScheduler
- **Mode**: Background thread (non-blocking)
- **Persistence**: In-memory (resets on server restart)
- **Trigger**: CronTrigger for precise timing

**Scheduled Jobs**:
```python
# Morning: 8:00 AM
scheduler.add_job(
    check_and_send_reminders,
    CronTrigger(hour=8, minute=0),
    id="morning_reminder"
)

# Afternoon: 1:00 PM
scheduler.add_job(
    check_and_send_reminders,
    CronTrigger(hour=13, minute=0),
    id="afternoon_reminder"
)

# Evening: 6:00 PM
scheduler.add_job(
    check_and_send_reminders,
    CronTrigger(hour=18, minute=0),
    id="evening_reminder"
)

# Night: 9:00 PM
scheduler.add_job(
    check_and_send_reminders,
    CronTrigger(hour=21, minute=0),
    id="night_reminder"
)
```

#### Timing Period Logic
```python
current_hour = datetime.now().hour

if 6 <= current_hour < 12:
    timing_period = "morning"
elif 12 <= current_hour < 17:
    timing_period = "afternoon"
elif 17 <= current_hour < 21:
    timing_period = "evening"
else:
    timing_period = "night"
```

#### Reminder Execution Flow
```
Scheduler Triggers (8AM/1PM/6PM/9PM)
    ↓
Determine current timing period
    ↓
Query MongoDB: schedules.find({ enabled: true, timings: timing_period })
    ↓
For each schedule:
    ↓
├─ Fetch user from MongoDB (email, fcm_token)
│   ↓
├─ Send Email Reminder (SMTP)
│   └─ HTML formatted email with medicine details
│   
├─ Send Push Notification (FCM) if token exists
│   └─ Firebase Admin SDK → FCM → Mobile Device
│   
└─ Update schedule: last_reminder_sent = current_timestamp
```

### 3.4 Notification Delivery System

#### 3.4.1 Email Notifications

**Configuration**:
```python
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587  # TLS
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")  # App-specific password
```

**Email Template**:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .medicine-card { border-left: 4px solid #667eea; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>💊</div>
            <h1>Medication Reminder</h1>
        </div>
        <div class="medicine-card">
            Medicine: {medicine_name}
            Dosage: {dosage}
            Time: {timing}
        </div>
    </div>
</body>
</html>
```

**Features**:
- HTML and plain text fallback
- Gradient header design
- Medicine card with colored border
- Automated "Do not reply" footer

#### 3.4.2 Push Notifications (Mobile)

**Architecture**:
```
Mobile App (Capacitor)
    ↓
@capacitor/push-notifications plugin
    ↓
Request permissions on login
    ↓
FCM Token generated by device
    ↓
POST /auth/fcm-token { fcm_token }
    ↓
Backend stores token in MongoDB (users.fcm_token)
    ↓
Scheduler triggers → Backend sends via Firebase Admin SDK
    ↓
Firebase Cloud Messaging
    ↓
Device receives notification (even when app closed)
```

**Frontend: Push Notification Hook**
```typescript
// src/hooks/use-push-notifications.ts
export const usePushNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const registerNotifications = async () => {
    // Request permissions
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') return null;

    // Register with FCM
    await PushNotifications.register();

    // Listen for token
    PushNotifications.addListener('registration', (token) => {
      console.log('[FCM] Token:', token.value);
      setFcmToken(token.value);
    });

    // Handle received notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[FCM] Notification received:', notification);
    });

    return fcmToken;
  };

  return { registerNotifications, fcmToken };
};
```

**Backend: Firebase Admin SDK**
```python
# medimind-backend/notification/fcm.py
import firebase_admin
from firebase_admin import credentials, messaging

def initialize_firebase():
    cred = credentials.Certificate("firebase_credentials.json")
    firebase_admin.initialize_app(cred)

def send_push_notification(fcm_token, title, body, data=None):
    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        data=data or {},
        token=fcm_token,
        android=messaging.AndroidConfig(
            priority="high",
            notification=messaging.AndroidNotification(
                icon="notification_icon",
                color="#667eea",
                sound="default",
                channel_id="medication_reminders"
            )
        )
    )
    
    response = messaging.send(message)
    return response
```

**Notification Payload**:
```json
{
  "notification": {
    "title": "💊 Time for your Amoxicillin",
    "body": "Take 250mg now (Afternoon)."
  },
  "data": {
    "type": "medication_reminder",
    "medicine_name": "Amoxicillin",
    "dosage": "250mg",
    "timing": "afternoon",
    "screen": "dashboard"
  }
}
```

**Android Configuration**:
```xml
<!-- android/app/src/main/res/values/strings.xml -->
<resources>
    <string name="notification_channel_id">medication_reminders</string>
    <string name="notification_channel_name">Medication Reminders</string>
</resources>
```

---

## 4. User Interface Design

### 4.1 Landing Page (Index)

**Components**:
- **Hero Section**: Animated gradient background with call-to-action
- **Features Section**: Card-based layout showcasing key features
- **How It Works**: Step-by-step process visualization
- **About Section**: Mission and vision statements
- **Navigation**: Sticky header with theme toggle (dark/light mode)
- **Footer**: Links and copyright information

**Animations**:
- Framer Motion for scroll-triggered reveals
- Lenis smooth scroll for parallax effects
- Shader gradients for dynamic backgrounds

### 4.2 Authentication Page

**Features**:
- Tabbed interface: Login / Signup
- Animated tab switching with layout transitions
- Form validation with error messages
- Secure password fields
- Session token management (web + mobile)
- Redirect to dashboard after successful auth

**User Experience**:
```
User enters email/password
    ↓
Frontend validation (email format, password length)
    ↓
API call: POST /auth/login or /auth/signup
    ↓
Success: Store session_id → Register push notifications → Navigate to dashboard
    ↓
Failure: Display error toast notification
```

### 4.3 Dashboard

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│  Header: MediMind Logo | User Info | Logout         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Upload Prescription Section                  │ │
│  │  [Drag & Drop Area] or [Browse Files Button]  │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  My Prescriptions (List)                      │ │
│  │  ┌─────────────────────────────────────────┐  │ │
│  │  │ Prescription #1 | Date | View Details  │  │ │
│  │  └─────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Active Medication Schedules                  │ │
│  │  ┌─────────────────────────────────────────┐  │ │
│  │  │ Amoxicillin | 250mg | Afternoon, Evening│  │ │
│  │  │ [Toggle: ON/OFF] [Delete]              │  │ │
│  │  └─────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Interactive Features**:
1. **File Upload**:
   - Drag-and-drop support
   - File type validation (image files only)
   - Loading state during processing
   - Success/error toast notifications

2. **Schedule Management**:
   - Toggle enable/disable individual schedules
   - Delete schedules with confirmation dialog
   - Real-time UI updates using React state
   - Visual indicators for active schedules

3. **Prescription History**:
   - Chronological list of uploaded prescriptions
   - View extracted text and structured data
   - Link to associated schedules

### 4.4 Mobile App (Capacitor)

**Platform**: Android APK/AAB
**Wrapper**: Capacitor WebView with native plugins

**Native Features**:
- Push notification permissions request on first login
- FCM token registration and storage
- Background notification handling (app closed/minimized)
- Notification action handling (tap to open app)
- Native notification channels

**Configuration** (`capacitor.config.ts`):
```typescript
{
  appId: 'com.medimind.app',
  appName: 'MediMind',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true  // For development
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
}
```

---

## 5. Security and Authentication

### 5.1 Password Security

**Hashing Algorithm**: Bcrypt
- **Salt Rounds**: 12 (2^12 iterations)
- **Storage**: Hashed password stored in MongoDB
- **Verification**: Constant-time comparison to prevent timing attacks

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

### 5.2 Session Management

**Technology**: Redis (in-memory data store)
- **Key Format**: `session:{session_id}`
- **Value**: User ID (string)
- **TTL**: 604800 seconds (7 days)
- **Auto-expiry**: Redis automatically removes expired sessions

**Session Creation**:
```python
async def create_session(user_id: str) -> str:
    session_id = secrets.token_urlsafe(32)  # Cryptographically secure random
    await redis_client.setex(
        f"session:{session_id}",
        604800,  # 7 days
        user_id
    )
    return session_id
```

**Session Validation**:
```python
async def get_user_from_session(session_id: str) -> str | None:
    user_id = await redis_client.get(f"session:{session_id}")
    return user_id.decode() if user_id else None
```

### 5.3 Authentication Middleware

**Dual Authentication Support**:
1. **Web (Cookie-based)**:
   ```python
   session_id = request.cookies.get("session_id")
   ```

2. **Mobile (Authorization Header)**:
   ```python
   auth_header = request.headers.get("Authorization")
   if auth_header and auth_header.startswith("Bearer "):
       session_id = auth_header[7:]  # Remove "Bearer " prefix
   ```

**Protected Routes**:
```python
async def require_user(request: Request):
    session_id = get_session_id_from_request(request)
    if not session_id:
        raise HTTPException(status_code=401, detail="Not logged in")
    
    user_id = await get_user_from_session(session_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Session expired")
    
    return user_id
```

### 5.4 CORS Configuration

**Challenge**: Mobile apps cannot use cookies due to WebView limitations
**Solution**: Allow all origins without credentials

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Required for Capacitor
    allow_credentials=False,  # Must be False with allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
```

**Security Note**: Session tokens are stored in localStorage (mobile) and validated on each request via Authorization header

### 5.5 Environment Variables

**Sensitive Configuration** (`.env` file - NOT committed to Git):
```bash
# MongoDB
MONGO_URI=mongodb://localhost:27017

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenRouter LLM
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=tngtech/deepseek-r1t2-chimera:free

# Email (SMTP)
EMAIL_ENABLED=true
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-specific-password

# Firebase (Push Notifications)
FIREBASE_CREDENTIALS_PATH=firebase_credentials.json
```

**`.gitignore` Protection**:
```bash
.env
firebase_credentials.json
google-services.json
```

---

## 6. Database Schema

### 6.1 MongoDB Collections

#### Users Collection
```javascript
{
  _id: ObjectId("675d4a1c2b3e4f5a6b7c8d9e"),
  email: "john.doe@example.com",
  password: "$2b$12$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP",  // Bcrypt hash
  fullName: "John Doe",
  created_at: ISODate("2025-12-15T08:30:00Z"),
  last_login: ISODate("2025-12-18T10:15:00Z"),
  fcm_token: "dA8zKj3fR9yT...",  // Firebase Cloud Messaging token
  fcm_updated_at: ISODate("2025-12-18T10:15:30Z")
}
```

**Indexes**:
- `email`: Unique index for fast lookup and duplicate prevention
- `_id`: Default primary key index

#### Prescriptions Collection
```javascript
{
  _id: ObjectId("675d4b2c3c4d5e6f7g8h9i0j"),
  user_id: "675d4a1c2b3e4f5a6b7c8d9e",  // Foreign key to users
  raw_text: "Amoxicillin 250mg tablets twice daily afternoon evening Paracetamol 500mg t.i.d.",
  structured_data: "[{\"medicine_name\":\"Amoxicillin\",\"dosage\":\"250mg\",...}]",  // JSON string
  created_at: ISODate("2025-12-18T10:20:00Z"),
  file_name: "prescription_2025-12-18.jpg"
}
```

**Indexes**:
- `user_id`: Index for querying user's prescriptions
- `created_at`: Index for sorting by date

#### Schedules Collection
```javascript
{
  _id: ObjectId("675d4c3d4e5f6g7h8i9j0k1l"),
  user_id: "675d4a1c2b3e4f5a6b7c8d9e",  // Foreign key to users
  prescription_id: "675d4b2c3c4d5e6f7g8h9i0j",  // Foreign key to prescriptions
  medicine_name: "Amoxicillin",
  dosage: "250mg",
  frequency: "twice a day",
  timings: ["afternoon", "evening"],  // Array of timing periods
  enabled: true,  // Toggle for active/inactive schedules
  created_at: ISODate("2025-12-18T10:20:05Z"),
  last_reminder_sent: ISODate("2025-12-18T18:00:00Z")  // Last notification timestamp
}
```

**Indexes**:
- `user_id`: Index for querying user's schedules
- `enabled`: Index for finding active schedules
- `timings`: Index for filtering by timing period
- Compound index: `{ enabled: 1, timings: 1 }` for efficient reminder queries

### 6.2 Redis Data Structure

**Session Storage**:
```
Key: session:xYz123AbC456DeF789...
Value: 675d4a1c2b3e4f5a6b7c8d9e  (user_id)
TTL: 604800 seconds (7 days)
```

**Characteristics**:
- In-memory storage for fast access
- Automatic expiration handling
- Distributed session support (scalable)
- No persistence required (sessions are temporary)

---

## 7. API Endpoints

### 7.1 Authentication Routes (`/auth`)

#### POST `/auth/signup`
**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Signup successful",
  "user_id": "675d4a1c2b3e4f5a6b7c8d9e",
  "email": "user@example.com",
  "session_id": "xYz123AbC456DeF789..."
}
```

**Cookies Set**: `session_id` (HttpOnly, 7 days)

#### POST `/auth/login`
**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "user_id": "675d4a1c2b3e4f5a6b7c8d9e",
  "email": "user@example.com",
  "fullName": "John Doe",
  "session_id": "xYz123AbC456DeF789..."
}
```

#### POST `/auth/logout`
**Headers**: `Cookie: session_id=...` or `Authorization: Bearer ...`
**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out"
}
```

#### GET `/auth/me`
**Headers**: `Cookie: session_id=...` or `Authorization: Bearer ...`
**Response** (200 OK):
```json
{
  "user_id": "675d4a1c2b3e4f5a6b7c8d9e",
  "email": "user@example.com",
  "fullName": "John Doe"
}
```

#### POST `/auth/fcm-token`
**Headers**: `Authorization: Bearer ...`
**Request**:
```json
{
  "fcm_token": "dA8zKj3fR9yT..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "FCM token updated"
}
```

### 7.2 Prescription Routes (`/api`)

#### POST `/api/upload-prescription`
**Headers**: `Authorization: Bearer ...`
**Request**: Multipart form data
```
file: [prescription_image.jpg]
user_id: 675d4a1c2b3e4f5a6b7c8d9e
```

**Response** (200 OK):
```json
{
  "success": true,
  "prescription_id": "675d4b2c3c4d5e6f7g8h9i0j",
  "schedule_ids": ["675d4c3d4e5f6g7h8i9j0k1l", "675d4c4e5f6g7h8i9j0k1l2m"],
  "medicines": [
    {
      "medicine_name": "Amoxicillin",
      "dosage": "250mg",
      "frequency": "twice a day",
      "timings": ["afternoon", "evening"]
    }
  ],
  "message": "Prescription processed successfully"
}
```

**Processing Steps**:
1. Upload and validate image file
2. Extract text using EasyOCR
3. Parse text using LLM (OpenRouter)
4. Store prescription in MongoDB
5. Create medication schedules
6. Return structured data

#### GET `/api/user/{user_id}/prescriptions`
**Headers**: `Authorization: Bearer ...`
**Response** (200 OK):
```json
[
  {
    "_id": "675d4b2c3c4d5e6f7g8h9i0j",
    "user_id": "675d4a1c2b3e4f5a6b7c8d9e",
    "raw_text": "Amoxicillin 250mg...",
    "structured_data": "[{...}]",
    "created_at": "2025-12-18T10:20:00Z"
  }
]
```

#### GET `/api/user/{user_id}/schedules`
**Headers**: `Authorization: Bearer ...`
**Response** (200 OK):
```json
[
  {
    "_id": "675d4c3d4e5f6g7h8i9j0k1l",
    "prescription_id": "675d4b2c3c4d5e6f7g8h9i0j",
    "medicine_name": "Amoxicillin",
    "dosage": "250mg",
    "frequency": "twice a day",
    "timings": ["afternoon", "evening"],
    "enabled": true,
    "last_reminder_sent": "2025-12-18T18:00:00Z"
  }
]
```

#### POST `/api/toggle-schedule`
**Headers**: `Authorization: Bearer ...`
**Request**:
```json
{
  "schedule_id": "675d4c3d4e5f6g7h8i9j0k1l",
  "enabled": false
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Schedule updated"
}
```

#### DELETE `/api/schedule/{schedule_id}`
**Headers**: `Authorization: Bearer ...`
**Response** (200 OK):
```json
{
  "success": true,
  "message": "Schedule deleted"
}
```

---

## 8. Deployment and DevOps

### 8.1 Backend Deployment

**Development Setup**:
```bash
cd medimind-backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**Production Configuration**:
```bash
# Use Gunicorn with Uvicorn workers
gunicorn app:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
```

**Environment Setup**:
1. Copy `.env.example` to `.env`
2. Configure MongoDB connection string
3. Set up Redis instance
4. Add OpenRouter API key
5. Configure SMTP credentials (Gmail App Password)
6. Place `firebase_credentials.json` in backend root

### 8.2 Frontend Deployment

**Web Build**:
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

**Static Hosting Options**:
- Vercel (recommended for React)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

**Environment Variables** (`.env`):
```bash
VITE_API_BASE_URL=https://api.medimind.example.com
```

### 8.3 Mobile Deployment (Android)

**Prerequisites**:
- Android Studio installed
- Android SDK configured
- Java Development Kit (JDK) 11+

**Build Process**:
```bash
# Build frontend
npm run build

# Add Android platform (first time only)
npx cap add android

# Sync web assets to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

**Android Configuration**:

1. **Place `google-services.json`**:
   ```
   android/app/google-services.json
   ```

2. **Update `android/app/build.gradle`**:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   
   dependencies {
       implementation platform('com.google.firebase:firebase-bom:32.7.0')
       implementation 'com.google.firebase:firebase-messaging'
   }
   ```

3. **Update `android/build.gradle`**:
   ```gradle
   dependencies {
       classpath 'com.google.gms:google-services:4.4.0'
   }
   ```

**Generate Signed APK/AAB**:
1. Build → Generate Signed Bundle / APK
2. Select APK or Android App Bundle (AAB for Play Store)
3. Create keystore or use existing
4. Build release variant
5. Output: `android/app/build/outputs/`

**Play Store Upload**:
1. Create Google Play Console account
2. Create new app listing
3. Upload AAB file
4. Complete store listing (screenshots, description, privacy policy)
5. Submit for review

### 8.4 Database Deployment

**MongoDB**:
- **Local Development**: MongoDB Community Server
- **Production Options**:
  - MongoDB Atlas (managed cloud)
  - Self-hosted on VPS (DigitalOcean, AWS EC2)
  - Docker container

**Redis**:
- **Local Development**: Redis Server or Docker container
- **Production Options**:
  - Redis Cloud (managed)
  - AWS ElastiCache
  - Docker container with persistence

**Connection String Examples**:
```bash
# MongoDB Local
MONGO_URI=mongodb://localhost:27017/medimind

# MongoDB Atlas
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/medimind

# Redis Local
REDIS_HOST=localhost
REDIS_PORT=6379

# Redis Cloud
REDIS_HOST=redis-12345.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=secure_password
```

---

## 9. Testing and Quality Assurance

### 9.1 Testing Strategy

**Unit Tests**:
- Password hashing and verification functions
- LLM prompt formatting and JSON parsing
- Timing period calculation logic
- Session token generation and validation

**Integration Tests**:
- OCR extraction accuracy
- LLM parsing reliability
- Database CRUD operations
- Email delivery success rate
- Push notification delivery

**End-to-End Tests**:
- Complete user registration flow
- Prescription upload and processing pipeline
- Schedule creation and management
- Notification delivery (email + push)

### 9.2 Error Handling

**Frontend Error Handling**:
```typescript
try {
  const response = await authApi.login({ email, password });
  // Success handling
} catch (error) {
  toast({
    title: "Login failed",
    description: error instanceof Error ? error.message : "An error occurred",
    variant: "destructive",
  });
}
```

**Backend Error Handling**:
```python
@router.post("/upload-prescription")
async def upload_prescription(file: UploadFile, user_id: str):
    try:
        # Processing logic
        return JSONResponse({"success": True, ...})
    except Exception as e:
        print(f"[ERROR] Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Upload failed")
```

**Logging**:
- Console logging with timestamps
- Error tracking for OCR failures
- LLM parsing error monitoring
- Email/push notification delivery logs

### 9.3 Performance Optimization

**Backend Optimizations**:
- EasyOCR model loaded once at startup (not per request)
- MongoDB connection pooling
- Redis connection reuse
- Async/await for I/O operations
- Background scheduler for non-blocking reminders

**Frontend Optimizations**:
- Code splitting with React.lazy()
- Image lazy loading
- Debounced search inputs
- React.memo for expensive components
- Vite's optimized production builds

---

## 10. Challenges and Solutions

### 10.1 OCR Accuracy

**Challenge**: Handwritten prescriptions and poor image quality result in low OCR accuracy

**Solutions**:
1. **Preprocessing**: Image enhancement (contrast, brightness)
2. **User Guidance**: Instructions for clear photos (good lighting, flat surface)
3. **Manual Correction**: Allow users to edit extracted text
4. **Fallback**: Manual entry option if OCR fails

### 10.2 LLM Parsing Reliability

**Challenge**: LLM may generate invalid JSON or misinterpret medical terminology

**Solutions**:
1. **Detailed Prompts**: Extensive prompt engineering with medical context
2. **JSON Validation**: Strict schema validation with fallback values
3. **Retry Logic**: Multiple attempts with error handling
4. **Low Temperature**: Set temperature=0.1 for deterministic output

### 10.3 Mobile CORS Issues

**Challenge**: Capacitor WebView cannot use cookies, causing authentication failures

**Solutions**:
1. **Dual Auth**: Support both cookie and Authorization header authentication
2. **CORS Config**: `allow_origins=["*"]` with `allow_credentials=False`
3. **Session Storage**: localStorage instead of cookies for mobile
4. **Token in Response**: Return `session_id` in response body for mobile apps

### 10.4 Firebase Secret Exposure

**Challenge**: Accidentally committed `firebase_credentials.json` to Git, triggering GitHub secret scanning

**Solutions**:
1. **Git History Cleanup**: Used `git reset` to remove commit with secrets
2. **`.gitignore` Update**: Added comprehensive ignore patterns
3. **Environment Variables**: Move to environment-based configuration
4. **Pre-commit Hooks**: Consider git-secrets or similar tools

### 10.5 Scheduler Persistence

**Challenge**: APScheduler runs in-memory; reminders reset on server restart

**Solutions**:
1. **Database-backed Scheduler**: Use SQLAlchemy jobstore (future enhancement)
2. **Startup Checks**: Query overdue reminders on server startup
3. **External Service**: Consider managed cron services (AWS EventBridge, Google Cloud Scheduler)

---

## 11. Future Enhancements

### 11.1 Planned Features

1. **Voice Input**:
   - Speech-to-text for prescription entry
   - Voice-based medication logging
   - Accessibility improvements

2. **Advanced Analytics**:
   - Medication adherence tracking
   - Missed dose reports
   - Compliance charts and insights

3. **Multi-language Support**:
   - Internationalization (i18n) for UI
   - Multi-language OCR support
   - Prescription parsing in multiple languages

4. **Telemedicine Integration**:
   - Doctor consultation links
   - Prescription sharing with healthcare providers
   - Electronic health record (EHR) integration

5. **Wearable Integration**:
   - Smartwatch notifications
   - Fitness tracker data correlation
   - Health metrics monitoring

6. **Family Account Management**:
   - Caregiver mode for elderly patients
   - Multiple user profiles per account
   - Shared medication schedules

7. **Pharmacy Integration**:
   - Automatic prescription refill reminders
   - Pharmacy locator
   - Price comparison for medications

8. **AI Improvements**:
   - Fine-tuned models for medical text
   - Custom OCR training with prescription datasets
   - Contextual medication recommendations

### 11.2 Scalability Considerations

**Current Limitations**:
- Single-server deployment
- In-memory scheduler
- No load balancing

**Scaling Solutions**:
1. **Horizontal Scaling**:
   - Load balancer (Nginx, AWS ALB)
   - Multiple backend instances
   - Shared Redis session store

2. **Database Scaling**:
   - MongoDB sharding for large datasets
   - Read replicas for query optimization
   - Caching layer (Redis for frequent queries)

3. **Notification Queue**:
   - Message queue (RabbitMQ, AWS SQS)
   - Worker processes for notification delivery
   - Retry logic for failed deliveries

4. **CDN for Frontend**:
   - CloudFlare or AWS CloudFront
   - Global edge caching
   - DDoS protection

---

## 12. Conclusion

MediMind represents a comprehensive solution to the critical healthcare challenge of medication adherence. By combining advanced AI technologies (OCR and LLM), modern web frameworks, and mobile capabilities, the system provides a seamless user experience that simplifies prescription management and ensures timely medication reminders.

### Key Achievements

1. **Automated Prescription Processing**: Reduced manual data entry through intelligent OCR and LLM parsing
2. **Multi-Platform Availability**: Accessible via web browsers and Android mobile app
3. **Reliable Notification System**: Dual-channel delivery (email + push) ensures users never miss medications
4. **Secure Architecture**: Industry-standard authentication, session management, and password hashing
5. **Scalable Design**: Modular architecture supports future enhancements and scaling

### Technical Impact

- **Time Savings**: Automates prescription interpretation (minutes vs. hours manually)
- **Accuracy**: LLM parsing reduces human error in dosage and timing
- **Accessibility**: Mobile app enables on-the-go medication management
- **Reliability**: Background scheduler with database persistence ensures consistent reminders

### Healthcare Value

MediMind addresses the World Health Organization's concern that "adherence to long-term therapy for chronic illnesses averages only 50%". By reducing the cognitive burden of medication management and providing intelligent reminders, the system has the potential to significantly improve patient outcomes, reduce hospital readmissions, and lower overall healthcare costs.

### Future Vision

The foundation established by MediMind enables future integration with telemedicine platforms, electronic health records, and wearable devices, positioning it as a central hub for personal healthcare management in an increasingly digital healthcare ecosystem.

---

## 13. References

### Technologies and Frameworks

1. **FastAPI**: https://fastapi.tiangolo.com/
2. **React**: https://react.dev/
3. **Capacitor**: https://capacitorjs.com/
4. **EasyOCR**: https://github.com/JaidedAI/EasyOCR
5. **OpenRouter**: https://openrouter.ai/
6. **Firebase Cloud Messaging**: https://firebase.google.com/docs/cloud-messaging
7. **MongoDB**: https://www.mongodb.com/docs/
8. **Redis**: https://redis.io/docs/
9. **APScheduler**: https://apscheduler.readthedocs.io/

### Research Papers and Articles

1. World Health Organization. (2003). "Adherence to Long-term Therapies: Evidence for Action"
2. Osterberg, L., & Blaschke, T. (2005). "Adherence to Medication". New England Journal of Medicine
3. Vrijens, B., et al. (2012). "A New Taxonomy for Describing and Defining Adherence to Medications". British Journal of Clinical Pharmacology

### Development Resources

1. **shadcn-ui Documentation**: https://ui.shadcn.com/
2. **Tailwind CSS**: https://tailwindcss.com/docs
3. **Framer Motion**: https://www.framer.com/motion/
4. **Vite**: https://vite.dev/

---

## Appendix A: Installation Guide

### Prerequisites

**System Requirements**:
- Node.js 18+ and npm
- Python 3.10+
- MongoDB 6.0+
- Redis 7.0+
- Android Studio (for mobile deployment)

### Backend Setup

```bash
# Clone repository
git clone https://github.com/yourusername/medimind.git
cd medimind/medimind-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Place Firebase credentials
# Download from Firebase Console → Project Settings → Service Accounts
# Save as firebase_credentials.json

# Run server
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
cd medimind

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# Run development server
npm run dev

# Build for production
npm run build
```

### Mobile Setup

```bash
# Build frontend first
npm run build

# Add Android platform
npx cap add android

# Place google-services.json
# Download from Firebase Console → Project Settings → General
# Save to: android/app/google-services.json

# Sync assets
npx cap sync android

# Open in Android Studio
npx cap open android

# Build APK in Android Studio:
# Build → Generate Signed Bundle / APK → APK → Next
# Create/select keystore → Build release
```

---

## Appendix B: Environment Configuration

### Backend `.env` Template

```bash
# MongoDB
MONGO_URI=mongodb://localhost:27017/medimind

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional

# OpenRouter API
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=tngtech/deepseek-r1t2-chimera:free

# Email (Gmail SMTP)
EMAIL_ENABLED=true
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=MediMind <your-email@gmail.com>

# Firebase
FIREBASE_CREDENTIALS_PATH=firebase_credentials.json

# CORS (Optional - defaults to allow all)
CORS_ORIGINS=http://localhost:5173,https://medimind.example.com
```

### Frontend `.env` Template

```bash
# API Base URL
VITE_API_BASE_URL=http://localhost:8000

# For production
# VITE_API_BASE_URL=https://api.medimind.example.com
```

### Android Configuration

**`android/app/google-services.json`** (from Firebase Console):
```json
{
  "project_info": {
    "project_number": "123456789",
    "project_id": "medimind-app",
    "storage_bucket": "medimind-app.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:123456789:android:abcdef123456",
        "android_client_info": {
          "package_name": "com.medimind.app"
        }
      }
    }
  ]
}
```

---

## Appendix C: Troubleshooting

### Common Issues

**1. OCR Not Working**
- **Error**: "EasyOCR model not found"
- **Solution**: OCR models download automatically on first run. Ensure internet connection and sufficient disk space (~500MB)

**2. LLM Parsing Fails**
- **Error**: "OpenRouter API error"
- **Solution**: Check OPENROUTER_API_KEY in .env. Verify API quota/credits

**3. Push Notifications Not Received**
- **Error**: No notifications on mobile
- **Solution**: 
  - Verify `google-services.json` is correctly placed
  - Check FCM token is stored in database
  - Ensure `firebase_credentials.json` is valid
  - Verify Firebase project has Cloud Messaging API enabled

**4. CORS Errors on Mobile**
- **Error**: "CORS policy blocked"
- **Solution**: 
  - Ensure backend CORS allows all origins
  - Use Authorization header instead of cookies
  - Check `allow_credentials=False` in CORS config

**5. Session Expired Immediately**
- **Error**: User logged out after page refresh
- **Solution**: 
  - Verify Redis is running
  - Check session TTL configuration
  - Ensure localStorage is not blocked

---

**Document Version**: 1.0  
**Last Updated**: December 18, 2025  
**Authors**: MediMind Development Team  
**Contact**: https://github.com/yourusername/medimind
