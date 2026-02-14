# 💊 MediMind

**MediMind** is an intelligent medication management platform that helps users track prescriptions, manage medication schedules, and receive timely reminders. The application leverages AI-powered OCR to extract prescription data from images and enriches medicine information with detailed descriptions, side effects, and interactions.

## ✨ Features

### 🔐 Authentication & User Management
- Secure user registration and login with bcrypt password hashing
- Session-based authentication with Redis
- Support for both web (cookie-based) and mobile (token-based) authentication
- FCM token management for push notifications

### 📸 AI-Powered Prescription Processing
- **OCR Extraction**: Upload prescription images (supports single images and ZIP files)
- **Vision AI**: Integration with Sarvam AI Vision for prescription text extraction
- **LLM Parsing**: Uses Groq AI to parse extracted text into structured medicine data
- **Image Quality Validation**: Automatic validation of uploaded images for optimal OCR results
- **Medicine Enrichment**: Enriches medicine data with:
  - Detailed descriptions
  - Dosage information
  - Side effects and contraindications
  - Drug interactions using Tavily AI search

### ⏰ Smart Medication Reminders
- **Scheduled Reminders**: Configurable medication schedules with timing preferences (morning, afternoon, evening, night)
- **Multi-Channel Notifications**: 
  - Email notifications
  - Push notifications via Firebase Cloud Messaging (FCM)
- **APScheduler Integration**: Background scheduler checks and sends reminders automatically
- **Toggle Control**: Enable/disable reminders per medication

### 📱 Cross-Platform Support
- **Progressive Web App (PWA)**: Works on any modern browser
- **Android Application**: Native Android app using Capacitor
- **Responsive Design**: Optimized for mobile, tablet, and desktop

### 🎨 Modern UI/UX
- Beautiful landing page with advanced parallax effects and 3D backgrounds
- Comprehensive dashboard with prescription history
- Theme support (light/dark mode)
- Smooth animations with Framer Motion and GSAP
- shadcn/ui component library for consistent design

## 🏗️ Architecture

MediMind follows a modern full-stack architecture with clear separation between frontend and backend:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Web App     │  │   Android    │  │     iOS      │ │
│  │  (Vite)      │  │  (Capacitor) │  │  (Capacitor) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │ REST API
                         │
┌────────────────────────▼────────────────────────────────┐
│                Backend (FastAPI)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │   Auth   │  │Prescription│ │ Scheduler│ │  FCM   │ │
│  │  Module  │  │   Module   │ │  Module  │ │Push    │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼───┐    ┌───▼────┐   ┌───▼────┐
   │MongoDB │    │ Redis  │   │Firebase│
   │Database│    │Sessions│   │  FCM   │
   └────────┘    └────────┘   └────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: 
  - Tailwind CSS 3.4
  - shadcn/ui component library
  - Framer Motion for animations
  - GSAP for advanced animations
- **Routing**: React Router DOM 6.30
- **State Management**: 
  - React Context API
  - TanStack Query (React Query) 5.83
- **3D Graphics**: 
  - Three.js
  - React Three Fiber
  - React Three Drei
- **Form Handling**: React Hook Form with Zod validation
- **Mobile**: Capacitor 8.1 with Push Notifications
- **UI Libraries**: 
  - Radix UI primitives
  - Lucide React icons
  - Recharts for data visualization

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn with standard extras
- **Database**: 
  - MongoDB (Motor for async, PyMongo for sync)
  - Redis for session management
- **Authentication**: 
  - Passlib with bcrypt for password hashing
  - Custom session management with Redis
- **AI/ML Integration**:
  - Sarvam AI for OCR vision processing
  - Groq AI for LLM-based prescription parsing
  - Tavily AI for medicine information enrichment
  - Google Generative AI
- **Task Scheduling**: APScheduler for medication reminders
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Validation**: Pydantic models with email validation
- **Image Processing**: Pillow (PIL) and NumPy
- **Environment**: python-dotenv for configuration

## 📁 Project Structure

```
medimind/
├── src/                          # Frontend React application
│   ├── components/               # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── Hero.tsx             # Landing page hero
│   │   ├── Features.tsx         # Features section
│   │   ├── Navigation.tsx       # Navigation bar
│   │   └── ...
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx      # Authentication context
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-push-notifications.ts
│   │   └── ...
│   ├── lib/                     # Utilities and API
│   │   ├── api.ts               # API client functions
│   │   └── utils.ts             # Utility functions
│   ├── pages/                   # Page components
│   │   ├── Index.tsx            # Landing page
│   │   ├── Auth.tsx             # Login/Signup page
│   │   ├── Dashboard.tsx        # User dashboard
│   │   └── NotFound.tsx         # 404 page
│   ├── App.tsx                  # Main app component
│   └── main.tsx                 # App entry point
│
├── medimind-backend/            # Backend FastAPI application
│   ├── auth/                    # Authentication module
│   │   ├── hash.py              # Password hashing
│   │   ├── routes.py            # Auth endpoints
│   │   └── sessions.py          # Session management
│   ├── db/                      # Database connections
│   │   ├── mongo.py             # MongoDB setup
│   │   └── redis.py             # Redis setup
│   ├── models/                  # Pydantic models
│   │   ├── user_model.py
│   │   └── session_model.py
│   ├── notification/            # Notification module
│   │   ├── fcm.py               # Firebase Cloud Messaging
│   │   └── service.py           # Notification service
│   ├── prescription/            # Prescription module
│   │   ├── routes.py            # Prescription endpoints
│   │   └── enrichment.py        # Medicine enrichment
│   ├── scheduler/               # Task scheduler
│   │   └── reminder_scheduler.py # Reminder scheduling
│   ├── app.py                   # FastAPI application
│   └── requirements.txt         # Python dependencies
│
├── android/                     # Android Capacitor project
│   └── app/
│       └── google-services.json # Firebase config
│
├── capacitor.config.ts          # Capacitor configuration
├── vite.config.ts               # Vite configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── package.json                 # Node.js dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.9+ with pip
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **Redis** (local or cloud instance)
- **Firebase Project** (for push notifications - optional)
- **API Keys**:
  - Sarvam AI API key
  - Groq API key
  - Google Generative AI API key
  - Tavily API key

### Installation

#### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd medimind
```

#### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
# Create a .env file in the root directory
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
```

#### 3. Backend Setup

```bash
# Navigate to backend directory
cd medimind-backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
# Create a .env file in medimind-backend directory with:
```

**Backend `.env` Configuration:**

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=medimind

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=  # Optional

# AI API Keys
SARVAM_API_KEY=your_sarvam_api_key
GROQ_API_KEY=your_groq_api_key
GOOGLE_API_KEY=your_google_api_key
TAVILY_API_KEY=your_tavily_api_key

# Firebase Configuration (Optional - for push notifications)
FIREBASE_CREDENTIALS_PATH=firebase_credentials.json
```

#### 4. Firebase Setup (Optional - for Push Notifications)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Navigate to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file as `firebase_credentials.json` in `medimind-backend/`
6. For Android app:
   - Download `google-services.json` from Firebase
   - Place it in `android/app/`

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd medimind-backend
uvicorn app:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Access the application at `http://localhost:5173`

Backend API documentation available at `http://localhost:8000/docs`

### Production Build

**Frontend:**
```bash
npm run build
npm run preview
```

**Backend:**
```bash
cd medimind-backend
uvicorn app:app --host 0.0.0.0 --port 8000
```

## 📱 Android App Deployment

### Build Android APK

```bash
# Build frontend
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

In Android Studio:
1. Build → Generate Signed Bundle / APK
2. Select APK
3. Configure signing key
4. Build Release APK

## 📡 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `POST /auth/update-fcm-token` - Update FCM token

### Prescriptions
- `POST /api/upload-prescription` - Upload prescription image
- `POST /api/upload-prescriptions-zip` - Upload multiple prescriptions (ZIP)
- `GET /api/prescriptions` - Get user's prescriptions
- `GET /api/prescription/{id}` - Get prescription details
- `DELETE /api/prescription/{id}` - Delete prescription

### Medication Schedules
- `GET /api/schedules` - Get medication schedules
- `POST /api/schedule` - Create medication schedule
- `POST /api/toggle-schedule` - Enable/disable schedule
- `DELETE /api/schedule/{id}` - Delete schedule

### Health & Status
- `GET /` - API info
- `GET /health` - Health check (database, scheduler status)

## 🔄 Key Features Breakdown

### 1. AI-Powered Prescription Processing
- Upload prescription images in JPG, PNG, or JPEG format
- Sarvam AI Vision extracts text from images
- Groq LLM parses text into structured JSON
- Automatic enrichment with medicine details via Tavily search

### 2. Intelligent Reminder System
- APScheduler runs background jobs every hour
- Checks for medications due in current time period
- Sends multi-channel notifications (email + push)
- Tracks reminder sent status

### 3. Secure Authentication
- Bcrypt password hashing with salt rounds
- Redis-based session management (7-day expiry)
- Support for both cookie and bearer token authentication
- Protected routes with middleware

### 4. Cross-Platform Design
- Capacitor bridges web and native mobile
- Shared API client for web and mobile
- Platform-specific optimizations
- Push notification support on Android

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Built with ❤️ using React, FastAPI, and AI**
