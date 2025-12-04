import os
from dotenv import load_dotenv

load_dotenv()

# Firebase Admin SDK initialization flag
_firebase_initialized = False

def initialize_firebase():
    """Initialize Firebase Admin SDK if not already initialized"""
    global _firebase_initialized
    
    if _firebase_initialized:
        return True
    
    try:
        import firebase_admin
        from firebase_admin import credentials
        
        # Check if already initialized
        try:
            firebase_admin.get_app()
            _firebase_initialized = True
            return True
        except ValueError:
            pass  # Not initialized yet
        
        # Path to Firebase credentials JSON file
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase_credentials.json")
        
        if not os.path.exists(cred_path):
            print(f"[FCM] Warning: Firebase credentials file not found at {cred_path}")
            print("[FCM] Push notifications will be disabled. To enable:")
            print("      1. Go to Firebase Console -> Project Settings -> Service Accounts")
            print("      2. Generate a new Private Key (JSON file)")
            print("      3. Save it as 'firebase_credentials.json' in the backend root")
            return False
        
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
        print("[FCM] Firebase Admin SDK initialized successfully")
        return True
        
    except Exception as e:
        print(f"[FCM] Error initializing Firebase: {str(e)}")
        return False


def send_push_notification(fcm_token: str, title: str, body: str, data: dict = None) -> bool:
    """
    Send a push notification to a device using Firebase Cloud Messaging
    
    Args:
        fcm_token: The device's FCM registration token
        title: Notification title
        body: Notification body text
        data: Optional data payload (for handling in app)
        
    Returns:
        bool: True if notification sent successfully, False otherwise
    """
    if not initialize_firebase():
        print("[FCM] Firebase not initialized, skipping push notification")
        return False
    
    if not fcm_token:
        print("[FCM] No FCM token provided, skipping push notification")
        return False
    
    try:
        from firebase_admin import messaging
        
        # Build the message
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            token=fcm_token,
            # Android specific configuration
            android=messaging.AndroidConfig(
                priority="high",
                notification=messaging.AndroidNotification(
                    icon="notification_icon",
                    color="#667eea",
                    sound="default",
                    channel_id="medication_reminders"
                )
            ),
            # iOS specific configuration
            apns=messaging.APNSConfig(
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(
                        sound="default",
                        badge=1
                    )
                )
            )
        )
        
        # Send the message
        response = messaging.send(message)
        print(f"[FCM] Successfully sent message: {response}")
        return True
        
    except Exception as e:
        error_msg = str(e)
        
        # Handle specific FCM errors
        if "not-registered" in error_msg.lower() or "invalid-registration" in error_msg.lower():
            print(f"[FCM] Token is invalid or expired: {fcm_token[:20]}...")
            # TODO: Mark token as invalid in database
        elif "sender-id-mismatch" in error_msg.lower():
            print("[FCM] Sender ID mismatch - check Firebase configuration")
        else:
            print(f"[FCM] Error sending notification: {error_msg}")
        
        return False


def send_medication_reminder_push(fcm_token: str, medicine_name: str, dosage: str, timing: str) -> bool:
    """
    Send a medication reminder push notification
    
    Args:
        fcm_token: The device's FCM registration token
        medicine_name: Name of the medication
        dosage: Dosage instructions
        timing: Time of day (morning/afternoon/evening/night)
        
    Returns:
        bool: True if sent successfully
    """
    title = f"💊 Time for your {medicine_name}"
    body = f"Take {dosage} now ({timing.capitalize()})."
    
    data = {
        "type": "medication_reminder",
        "medicine_name": medicine_name,
        "dosage": dosage,
        "timing": timing,
        "screen": "dashboard"  # For app navigation
    }
    
    return send_push_notification(fcm_token, title, body, data)
