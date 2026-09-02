import os
import json
import urllib.request
import urllib.error

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
DEFAULT_FROM_EMAIL = os.environ.get("RESEND_FROM_EMAIL", "L-PRES Marketplace <onboarding@resend.dev>")


def send_resend_email(to_email: str, subject: str, html_content: str, text_content: str = "") -> bool:
    """
    Sends an transactional email using the Resend HTTP API.
    Falls back gracefully to logging if RESEND_API_KEY is not configured or on network error.
    """
    api_key = os.environ.get("RESEND_API_KEY", RESEND_API_KEY)
    from_email = os.environ.get("RESEND_FROM_EMAIL", DEFAULT_FROM_EMAIL)

    if not api_key:
        print(f"[RESEND EMAIL LOG (DRY RUN)] To: {to_email} | Subject: {subject}")
        print(f"Content: {text_content or subject}")
        return True

    url = "https://api.resend.com/emails"
    payload = {
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "html": html_content,
    }
    if text_content:
        payload["text"] = text_content

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "LPRES-Marketplace/1.0",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
            print(f"[RESEND EMAIL SENT SUCCESS] ID: {resp_data.get('id')} to {to_email}")
            return True
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"[RESEND EMAIL ERROR {e.code}] To: {to_email} | {err_msg}")
        return False
    except Exception as e:
        print(f"[RESEND EMAIL EXCEPTION] To: {to_email} | Error: {str(e)}")
        return False


def send_welcome_email(user_email: str, user_name: str):
    subject = "Welcome to Kwara L-PRES Livestock & Agro Marketplace"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #334155;">
            <h2 style="color: #10b981; margin: 0;">Kwara L-PRES Marketplace</h2>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">State Project Coordinating Office</p>
        </div>
        <div style="padding: 24px 0;">
            <h3 style="color: #ffffff;">Hello {user_name}, welcome aboard!</h3>
            <p style="color: #cbd5e1; line-height: 1.6;">
                Thank you for registering on the official <strong>Kwara State L-PRES Enterprise Livestock & Agro Marketplace</strong>.
            </p>
            <p style="color: #cbd5e1; line-height: 1.6;">
                You can now browse verified livestock listings, submit enterprise trade requests with 1% veterinary inspection protection, and manage your marketer profile.
            </p>
            <div style="margin: 24px 0; background: #1e293b; padding: 16px; border-left: 4px solid #10b981; border-radius: 4px;">
                <strong style="color: #10b981;">What's next?</strong>
                <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 14px;">
                    Request official marketer verification in your dashboard to obtain the verified Kwara L-PRES badge.
                </p>
            </div>
        </div>
        <div style="border-top: 1px solid #334155; padding-top: 16px; text-align: center; color: #64748b; font-size: 12px;">
            &copy; 2026 Kwara State Livestock Productivity & Resilience Support Project (L-PRES)
        </div>
    </div>
    """
    text = f"Hello {user_name}, welcome to Kwara L-PRES Marketplace! You can now browse products and make trade requests."
    send_resend_email(user_email, subject, html, text)


def send_new_trade_request_email(buyer_email: str, buyer_name: str, request_code: str, product_name: str, total_amount: str):
    subject = f"Trade Request Confirmation [{request_code}] — Kwara L-PRES"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #334155;">
            <h2 style="color: #10b981; margin: 0;">Trade Request Received</h2>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Request Code: <strong>{request_code}</strong></p>
        </div>
        <div style="padding: 24px 0;">
            <p style="color: #cbd5e1; line-height: 1.6;">Dear {buyer_name},</p>
            <p style="color: #cbd5e1; line-height: 1.6;">
                Your enterprise trade request for <strong>{product_name}</strong> has been successfully registered with Kwara L-PRES State Project Office.
            </p>
            <div style="background: #1e293b; padding: 18px; border-radius: 8px; margin: 20px 0;">
                <table style="width: 100%; color: #cbd5e1; font-size: 14px;">
                    <tr><td style="padding: 4px 0; color: #94a3b8;">Request Code:</td><td><strong>{request_code}</strong></td></tr>
                    <tr><td style="padding: 4px 0; color: #94a3b8;">Item:</td><td>{product_name}</td></tr>
                    <tr><td style="padding: 4px 0; color: #94a3b8;">Estimated Total:</td><td><strong style="color: #10b981;">{total_amount}</strong></td></tr>
                    <tr><td style="padding: 4px 0; color: #94a3b8;">Status:</td><td><span style="background: #eab308; color: #000; padding: 2px 8px; border-radius: 12px; font-weight: bold; font-size: 12px;">Pending Review</span></td></tr>
                </table>
            </div>
            <p style="color: #cbd5e1; line-height: 1.6;">
                An L-PRES trade facilitation officer will review your request, verify producer stock, and contact you shortly.
            </p>
        </div>
        <div style="border-top: 1px solid #334155; padding-top: 16px; text-align: center; color: #64748b; font-size: 12px;">
            &copy; 2026 Kwara State L-PRES Marketplace Admin
        </div>
    </div>
    """
    text = f"Dear {buyer_name}, your trade request {request_code} for {product_name} ({total_amount}) has been received and is under review by Kwara L-PRES."
    send_resend_email(buyer_email, subject, html, text)


def send_request_approved_email(buyer_email: str, buyer_name: str, request_code: str, product_name: str):
    subject = f"Trade Request Approved [{request_code}] — Kwara L-PRES"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #334155;">
            <h2 style="color: #10b981; margin: 0;">Trade Request Approved!</h2>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Request Code: <strong>{request_code}</strong></p>
        </div>
        <div style="padding: 24px 0;">
            <p style="color: #cbd5e1; line-height: 1.6;">Dear {buyer_name},</p>
            <p style="color: #cbd5e1; line-height: 1.6;">
                Great news! Your trade request for <strong>{product_name}</strong> has been <strong>APPROVED</strong> by the Kwara L-PRES Marketplace Administrator.
            </p>
            <div style="background: #064e3b; border: 1px solid #10b981; padding: 18px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #a7f3d0; margin: 0; font-weight: bold;">Status: Approved / Under Facilitation</p>
                <p style="color: #cbd5e1; font-size: 14px; margin-top: 8px;">
                    Our logistics & veterinary inspection team is coordinating stock release with the producer.
                </p>
            </div>
            <p style="color: #cbd5e1; line-height: 1.6;">
                You will receive another update as soon as dispatch/haulage commences.
            </p>
        </div>
        <div style="border-top: 1px solid #334155; padding-top: 16px; text-align: center; color: #64748b; font-size: 12px;">
            &copy; 2026 Kwara State L-PRES Marketplace Admin
        </div>
    </div>
    """
    text = f"Dear {buyer_name}, your trade request {request_code} for {product_name} has been APPROVED by Kwara L-PRES Admin."
    send_resend_email(buyer_email, subject, html, text)


def send_request_shipped_email(buyer_email: str, buyer_name: str, request_code: str, product_name: str, admin_notes: str = ""):
    subject = f"Order Dispatched / Shipped [{request_code}] — Kwara L-PRES"
    notes_block = f"""
    <div style="background: #1e293b; padding: 14px; border-radius: 6px; margin-top: 12px;">
        <strong style="color: #38bdf8;">Dispatch Note from Admin:</strong>
        <p style="color: #e2e8f0; margin: 4px 0 0 0;">{admin_notes}</p>
    </div>
    """ if admin_notes else ""

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #334155;">
            <h2 style="color: #38bdf8; margin: 0;">Order Shipped / Dispatched</h2>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Request Code: <strong>{request_code}</strong></p>
        </div>
        <div style="padding: 24px 0;">
            <p style="color: #cbd5e1; line-height: 1.6;">Dear {buyer_name},</p>
            <p style="color: #cbd5e1; line-height: 1.6;">
                Your order of <strong>{product_name}</strong> is now in transit / shipped to your delivery location!
            </p>
            <div style="background: #0c4a6e; border: 1px solid #38bdf8; padding: 18px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #bae6fd; margin: 0; font-weight: bold;">Status: Shipped / Logistics Dispatched</p>
                <p style="color: #e0f2fe; font-size: 14px; margin-top: 8px;">
                    L-PRES haulage team is delivering your shipment. Please ensure your contact phone is reachable.
                </p>
                {notes_block}
            </div>
            <p style="color: #cbd5e1; line-height: 1.6;">
                Upon receipt and verification of item quality, please confirm receipt to finalize escrow settlement.
            </p>
        </div>
        <div style="border-top: 1px solid #334155; padding-top: 16px; text-align: center; color: #64748b; font-size: 12px;">
            &copy; 2026 Kwara State L-PRES Marketplace Admin
        </div>
    </div>
    """
    text = f"Dear {buyer_name}, your order {request_code} ({product_name}) has been SHIPPED. Notes: {admin_notes}"
    send_resend_email(buyer_email, subject, html, text)
