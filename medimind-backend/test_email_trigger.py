"""
╔══════════════════════════════════════════════════════════════╗
║             MediMind - Email Notification Test               ║
║     Test email sending with sample prescription data         ║
╚══════════════════════════════════════════════════════════════╝

Usage:
  python test_email_trigger.py

Requirements:
  pip install python-dotenv

Before running, create a .env file with:
  EMAIL_ENABLED=true
  SMTP_SERVER=smtp.gmail.com
  SMTP_PORT=587
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASSWORD=your-app-password       # Use Gmail App Password, NOT regular password
  EMAIL_FROM=your-email@gmail.com

To get a Gmail App Password:
  1. Go to https://myaccount.google.com/apppasswords
  2. Select "Mail" and your device
  3. Copy the 16-char password and paste it as EMAIL_PASSWORD
"""

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("[!] python-dotenv not installed. Using environment variables directly.")


# ══════════════════════════════════════════════════════════════
# Configuration
# ══════════════════════════════════════════════════════════════

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
EMAIL_USER = os.getenv("EMAIL_USER", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", EMAIL_USER)

# ═══ Change this to YOUR email to receive the test ═══
TEST_RECIPIENT = os.getenv("TEST_EMAIL", "hemasaigupta@gmail.com")


# ══════════════════════════════════════════════════════════════
# Fake Prescription Data
# ══════════════════════════════════════════════════════════════

FAKE_PRESCRIPTION = {
    "patient_name": "Hema sai Gupta",
    "doctor_name": "Dr. Ananya Sharma",
    "clinic": "Apollo Health Clinic, Hyderabad",
    "date": "15-Feb-2026",
    "medications": [
        {
            "name": "Amoxicillin 500mg",
            "dosage": "1 capsule",
            "frequency": "3 times a day",
            "timings": ["Morning", "Afternoon", "Night"],
            "duration": "7 days",
            "instructions": "Take after food",
        },
        {
            "name": "Cetirizine 10mg",
            "dosage": "1 tablet",
            "frequency": "Once daily",
            "timings": ["Night"],
            "duration": "5 days",
            "instructions": "Take before bed",
        },
        {
            "name": "Pantoprazole 40mg",
            "dosage": "1 tablet",
            "frequency": "Once daily",
            "timings": ["Morning"],
            "duration": "14 days",
            "instructions": "Take 30 min before breakfast on empty stomach",
        },
        {
            "name": "Vitamin D3 60000 IU",
            "dosage": "1 sachet",
            "frequency": "Once a week",
            "timings": ["Morning"],
            "duration": "8 weeks",
            "instructions": "Dissolve in water after breakfast",
        },
    ],
}


# ══════════════════════════════════════════════════════════════
# Build beautiful HTML email
# ══════════════════════════════════════════════════════════════

def build_medication_rows(medications: list) -> str:
    """Build HTML rows for each medication"""
    rows = ""
    for i, med in enumerate(medications):
        timing_badges = ""
        for t in med["timings"]:
            emoji = {"Morning": "🌅", "Afternoon": "☀️", "Evening": "🌇", "Night": "🌙"}.get(t, "⏰")
            timing_badges += f'<span style="display:inline-block;background:#FFF5F0;color:#E8590C;font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;margin-right:4px;">{emoji} {t}</span>'

        rows += f"""
        <tr>
            <td style="padding:20px 24px;{' border-top:1px solid #f0e6df;' if i > 0 else ''}">
                <div style="margin-bottom:8px;">
                    <span style="font-size:16px;font-weight:800;color:#1a1a1a;">{med['name']}</span>
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                    <tr>
                        <td style="padding:4px 0;">
                            <span style="font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px;">Dosage</span>
                            <br/>
                            <span style="font-size:14px;font-weight:600;color:#333;">{med['dosage']} — {med['frequency']}</span>
                        </td>
                        <td style="padding:4px 0;text-align:right;">
                            <span style="font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px;">Duration</span>
                            <br/>
                            <span style="font-size:14px;font-weight:600;color:#333;">{med['duration']}</span>
                        </td>
                    </tr>
                </table>
                <div style="margin-bottom:8px;">
                    {timing_badges}
                </div>
                <div style="background:#F8F9FA;border-radius:8px;padding:8px 12px;font-size:12px;color:#666;">
                    💡 {med['instructions']}
                </div>
            </td>
        </tr>
        """
    return rows


def build_html_email(prescription: dict) -> str:
    """Build the full HTML email"""
    med_rows = build_medication_rows(prescription["medications"])
    med_count = len(prescription["medications"])
    now = datetime.now().strftime("%I:%M %p")

    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1a1a1a;background-color:#f5f0ec;">
    <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
        <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">

            <!-- Header -->
            <div style="background:linear-gradient(135deg,#E8590C,#D94F0C);padding:32px 24px;text-align:center;">
                <div style="font-size:40px;margin-bottom:8px;">📋</div>
                <h1 style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.3px;margin:0;">
                    Prescription Processed
                </h1>
                <p style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:500;margin-top:4px;">
                    Your prescription has been analyzed by MediMind AI
                </p>
            </div>

            <!-- Prescription Info -->
            <div style="padding:24px;background:#FDF9F7;border-bottom:1px solid #f0e6df;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding:6px 0;">
                            <span style="font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px;">Patient</span>
                            <br/>
                            <span style="font-size:15px;font-weight:700;color:#1a1a1a;">{prescription['patient_name']}</span>
                        </td>
                        <td style="padding:6px 0;text-align:right;">
                            <span style="font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px;">Date</span>
                            <br/>
                            <span style="font-size:15px;font-weight:700;color:#1a1a1a;">{prescription['date']}</span>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding:6px 0;">
                            <span style="font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px;">Prescribed By</span>
                            <br/>
                            <span style="font-size:14px;font-weight:600;color:#555;">{prescription['doctor_name']} — {prescription['clinic']}</span>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Medications Header -->
            <div style="padding:20px 24px 8px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <span style="font-size:16px;font-weight:800;color:#1a1a1a;">Medications</span>
                        </td>
                        <td style="text-align:right;">
                            <span style="display:inline-block;background:#E8590C;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;">
                                {med_count} medicine{'s' if med_count > 1 else ''}
                            </span>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Medication List -->
            <table width="100%" cellpadding="0" cellspacing="0">
                {med_rows}
            </table>

            <!-- Reminders Set Notice -->
            <div style="padding:20px 24px;">
                <div style="background:linear-gradient(135deg,#F0FFF0,#E8F5E9);border:1px solid #C8E6C9;border-radius:12px;padding:16px 20px;text-align:center;">
                    <span style="font-size:20px;">✅</span>
                    <p style="font-size:14px;font-weight:700;color:#2E7D32;margin:6px 0 2px;">Reminders Activated</p>
                    <p style="font-size:12px;color:#558B2F;margin:0;">We'll send you timely reminders for each medication</p>
                </div>
            </div>

            <!-- Footer -->
            <div style="padding:20px 24px;border-top:1px solid #f0e6df;text-align:center;">
                <p style="font-size:14px;font-weight:800;color:#E8590C;margin:0 0 4px;">MediMind</p>
                <p style="font-size:11px;color:#aaa;line-height:1.5;margin:0;">
                    AI-Powered Prescription Management<br/>
                    This is an automated notification. Do not reply to this email.<br/>
                    Sent at {now} IST
                </p>
            </div>
        </div>

        <!-- Unsubscribe -->
        <p style="text-align:center;font-size:10px;color:#bbb;margin-top:16px;">
            You received this because you uploaded a prescription to MediMind.<br/>
            To stop, disable email notifications in your profile settings.
        </p>
    </div>
</body>
</html>
    """.strip()


def build_plain_text(prescription: dict) -> str:
    """Build plain text fallback"""
    lines = [
        "📋 Prescription Processed — MediMind",
        "=" * 45,
        f"Patient: {prescription['patient_name']}",
        f"Doctor: {prescription['doctor_name']}",
        f"Clinic: {prescription['clinic']}",
        f"Date: {prescription['date']}",
        "",
        f"MEDICATIONS ({len(prescription['medications'])})",
        "-" * 45,
    ]

    for med in prescription["medications"]:
        timings = ", ".join(med["timings"])
        lines.extend([
            f"  💊 {med['name']}",
            f"     Dosage: {med['dosage']} — {med['frequency']}",
            f"     Duration: {med['duration']}",
            f"     Timings: {timings}",
            f"     Note: {med['instructions']}",
            "",
        ])

    lines.extend([
        "✅ Reminders have been activated for your medications.",
        "",
        "— MediMind | AI-Powered Prescription Management",
    ])

    return "\n".join(lines)


# ══════════════════════════════════════════════════════════════
# Send email
# ══════════════════════════════════════════════════════════════

def send_test_email(recipient: str, prescription: dict) -> bool:
    """Send the test prescription email"""

    if not EMAIL_USER or not EMAIL_PASSWORD:
        print("\n❌ ERROR: Email credentials not configured!")
        print("   Create a .env file in this directory with:")
        print("     EMAIL_ENABLED=true")
        print("     EMAIL_USER=your-email@gmail.com")
        print("     EMAIL_PASSWORD=your-app-password")
        print("\n   For Gmail, generate an App Password at:")
        print("   https://myaccount.google.com/apppasswords")
        return False

    subject = f"📋 Prescription Processed — {len(prescription['medications'])} Medications Found"
    plain_body = build_plain_text(prescription)
    html_body = build_html_email(prescription)

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = EMAIL_FROM
        msg["To"] = recipient
        msg["Subject"] = subject

        msg.attach(MIMEText(plain_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        print(f"\n📧 Connecting to {SMTP_SERVER}:{SMTP_PORT}...")

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            print("🔐 TLS secured")
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            print("✅ Authenticated")
            server.send_message(msg)

        print(f"\n✅ Email sent successfully to {recipient}!")
        print(f"   Subject: {subject}")
        print(f"   Medications: {len(prescription['medications'])}")
        return True

    except smtplib.SMTPAuthenticationError:
        print("\n❌ Authentication failed!")
        print("   If using Gmail, make sure you're using an App Password.")
        print("   Generate one at: https://myaccount.google.com/apppasswords")
        return False
    except Exception as e:
        print(f"\n❌ Failed to send email: {e}")
        return False


# ══════════════════════════════════════════════════════════════
# Main
# ══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("╔" + "═" * 58 + "╗")
    print("║     MediMind — Email Notification Test Script            ║")
    print("╚" + "═" * 58 + "╝")
    print()
    print(f"  Recipient : {TEST_RECIPIENT}")
    print(f"  SMTP      : {SMTP_SERVER}:{SMTP_PORT}")
    print(f"  From      : {EMAIL_FROM or '(not set)'}")
    print(f"  Medicines : {len(FAKE_PRESCRIPTION['medications'])}")
    print()

    # Show preview
    print("📋 Prescription Preview:")
    print(f"   Patient: {FAKE_PRESCRIPTION['patient_name']}")
    print(f"   Doctor: {FAKE_PRESCRIPTION['doctor_name']}")
    for med in FAKE_PRESCRIPTION["medications"]:
        print(f"   💊 {med['name']} — {med['dosage']} ({', '.join(med['timings'])})")
    print()

    confirm = input("Send test email? (y/n): ").strip().lower()
    if confirm == "y":
        send_test_email(TEST_RECIPIENT, FAKE_PRESCRIPTION)
    else:
        print("Cancelled.")

    print()
