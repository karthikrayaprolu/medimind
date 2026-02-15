import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

EMAIL_ENABLED = os.getenv("EMAIL_ENABLED", "false").lower() == "true"
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
EMAIL_USER = os.getenv("EMAIL_USER", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", EMAIL_USER)


def send_email(to_email: str, subject: str, body: str, html_body: str = None) -> bool:
    """
    Send email notification to user
    
    Args:
        to_email: Recipient email address
        subject: Email subject line
        body: Plain text email body
        html_body: Optional HTML formatted email body
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    if not EMAIL_ENABLED:
        print(f"[EMAIL] Disabled. Would send to {to_email}: {subject}")
        return False
    
    if not EMAIL_USER or not EMAIL_PASSWORD:
        print("[EMAIL] Error: EMAIL_USER or EMAIL_PASSWORD not configured")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["From"] = EMAIL_FROM
        msg["To"] = to_email
        msg["Subject"] = subject
        
        # Add plain text and HTML parts
        msg.attach(MIMEText(body, "plain"))
        if html_body:
            msg.attach(MIMEText(html_body, "html"))
        
        # Connect to SMTP server and send
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.send_message(msg)
        
        print(f"[EMAIL] Sent to {to_email}: {subject}")
        return True
        
    except Exception as e:
        print(f"[EMAIL] Error sending to {to_email}: {str(e)}")
        return False


def send_medication_reminder(to_email: str, medicine_name: str, dosage: str, timing: str) -> bool:
    """
    Send medication reminder notification
    
    Args:
        to_email: User email address
        medicine_name: Name of the medication
        dosage: Dosage instructions
        timing: Time of day (morning/afternoon/evening/night)
        
    Returns:
        bool: True if sent successfully
    """
    subject = f"💊 MediMind Reminder: {medicine_name}"
    
    body = f"""
Hello,

This is your medication reminder from MediMind.

Medicine: {medicine_name}
Dosage: {dosage}
Time: {timing.capitalize()}

Please take your medication as prescribed.

---
MediMind - AI-Powered Prescription Management
    """.strip()
    
    html_body = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f5f0ec; }}
        .wrapper {{ max-width: 560px; margin: 0 auto; padding: 32px 16px; }}
        .card {{ background: #ffffff; border-radius: 16px; overflow: hidden; }}

        /* Header */
        .header {{ background-color: #E8590C; padding: 28px 24px; text-align: center; }}
        .header-logo {{ font-size: 32px; margin-bottom: 4px; }}
        .header-title {{ color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.3px; margin: 0; }}
        .header-subtitle {{ color: rgba(255,255,255,0.8); font-size: 13px; font-weight: 500; margin-top: 2px; }}

        /* Body */
        .body {{ padding: 28px 24px; }}
        .greeting {{ font-size: 15px; color: #555; margin-bottom: 20px; }}

        /* Medicine Card */
        .med-card {{ background: #FDF9F7; border: 1px solid #f0e6df; border-left: 4px solid #E8590C; border-radius: 12px; padding: 20px; margin-bottom: 20px; }}
        .med-row {{ display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }}
        .med-row + .med-row {{ border-top: 1px solid #f0e6df; }}
        .med-label {{ font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }}
        .med-value {{ font-size: 15px; font-weight: 700; color: #1a1a1a; text-align: right; }}
        .med-value.primary {{ color: #E8590C; }}

        /* CTA */
        .cta-text {{ font-size: 14px; color: #555; margin-bottom: 24px; line-height: 1.7; }}
        .cta-note {{ display: inline-block; background: #FDF9F7; border: 1px solid #f0e6df; border-radius: 8px; padding: 10px 16px; font-size: 13px; color: #E8590C; font-weight: 600; }}

        /* Footer */
        .footer {{ padding: 20px 24px; border-top: 1px solid #f5f0ec; text-align: center; }}
        .footer-brand {{ font-size: 13px; font-weight: 700; color: #E8590C; margin-bottom: 4px; }}
        .footer-text {{ font-size: 11px; color: #aaa; line-height: 1.5; }}
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">
            <!-- Header -->
            <div class="header">
                <div class="header-logo">💊</div>
                <h1 class="header-title">Medication Reminder</h1>
                <p class="header-subtitle">It's time to take your medicine</p>
            </div>

            <!-- Body -->
            <div class="body">
                <p class="greeting">Hello, here's your scheduled reminder from MediMind.</p>

                <!-- Medicine Details -->
                <div class="med-card">
                    <div class="med-row">
                        <span class="med-label">Medicine</span>
                        <span class="med-value primary">{medicine_name}</span>
                    </div>
                    <div class="med-row">
                        <span class="med-label">Dosage</span>
                        <span class="med-value">{dosage}</span>
                    </div>
                    <div class="med-row">
                        <span class="med-label">Time</span>
                        <span class="med-value">{timing.capitalize()}</span>
                    </div>
                </div>

                <p class="cta-text">Please take your medication as prescribed by your doctor. Staying consistent helps your treatment work best.</p>
                <div style="text-align: center;">
                    <span class="cta-note">✓ Stay on track with MediMind</span>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p class="footer-brand">MediMind</p>
                <p class="footer-text">AI-Powered Prescription Management<br>This is an automated reminder. Do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>
    """.strip()
    
    return send_email(to_email, subject, body, html_body)
