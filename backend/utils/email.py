import os
import json
import base64
import urllib.request
import urllib.error

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
DEFAULT_FROM_EMAIL = os.environ.get("RESEND_FROM_EMAIL", "Kwara L-PRES Marketplace <onboarding@resend.dev>")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@lpres.kw.gov.ng")

# Cache loaded logo base64
_cached_logo_b64 = None

def get_logo_base64() -> str:
    """Reads and caches the L-PRES logo as base64 for embedding in HTML emails."""
    global _cached_logo_b64
    if _cached_logo_b64 is not None:
        return _cached_logo_b64

    possible_paths = [
        os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "lpres-logo.png"),
        os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "lpres-logo.png"),
        os.path.join(os.path.abspath(os.curdir), "frontend", "public", "lpres-logo.png"),
    ]

    for p in possible_paths:
        if os.path.exists(p):
            try:
                with open(p, "rb") as f:
                    _cached_logo_b64 = base64.b64encode(f.read()).decode("utf-8")
                    return _cached_logo_b64
            except Exception as e:
                print(f"[LOGO LOAD WARNING] Error reading {p}: {e}")
    _cached_logo_b64 = ""
    return ""


def send_resend_email(to_email: str, subject: str, html_content: str, text_content: str = "") -> bool:
    """
    Sends a transactional email using the Resend HTTP API.
    Falls back gracefully to logging if RESEND_API_KEY is not configured or on network error.
    """
    api_key = os.environ.get("RESEND_API_KEY", RESEND_API_KEY)
    from_email = os.environ.get("RESEND_FROM_EMAIL", DEFAULT_FROM_EMAIL)

    if not api_key:
        print(f"[RESEND EMAIL LOG (DRY RUN)] To: {to_email} | Subject: {subject}")
        print(f"Content snippet: {text_content[:150] or subject}")
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


def get_html_template(header_title: str, body_html: str, preheader: str = "") -> str:
    """
    Renders a unified Kwara L-PRES HTML Email Letter with the official logo, brand green accents,
    dark slate container styling, and responsive layout.
    """
    logo_b64 = get_logo_base64()
    if logo_b64:
        logo_img_tag = f'<img src="data:image/png;base64,{logo_b64}" alt="Kwara L-PRES Logo" style="max-height: 65px; max-width: 220px; object-fit: contain; margin-bottom: 12px;" />'
    else:
        logo_img_tag = '<div style="font-size: 24px; font-weight: bold; color: #10b981; margin-bottom: 8px;">KWARA STATE L-PRES</div>'

    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{header_title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #f8fafc; -webkit-font-smoothing: antialiased;">
    <!-- Preheader Text -->
    <div style="display: none; max-height: 0px; overflow: hidden;">
        {preheader or header_title}
    </div>

    <!-- Main Container -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 30px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" style="max-width: 600px; background-color: #0f172a; border-radius: 14px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
                    
                    <!-- Official Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #042f2e 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #10b981;">
                            {logo_img_tag}
                            <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                                Kwara State L-PRES Marketplace
                            </h2>
                            <p style="color: #10b981; font-size: 13px; font-weight: 600; margin: 6px 0 0 0; letter-spacing: 0.4px;">
                                Livestock Productivity & Resilience Support Project — State Project Coordinating Office
                            </p>
                        </td>
                    </tr>

                    <!-- Letter Body -->
                    <tr>
                        <td style="padding: 32px 28px; line-height: 1.65; font-size: 15px; color: #cbd5e1;">
                            {body_html}
                        </td>
                    </tr>

                    <!-- Official Footer -->
                    <tr>
                        <td style="background-color: #0b1120; padding: 24px; text-align: center; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b;">
                            <p style="margin: 0 0 8px 0; font-weight: 600; color: #94a3b8;">
                                Kwara State Project Coordinating Office (SPCO)
                            </p>
                            <p style="margin: 0 0 12px 0;">
                                Ministry of Agriculture & Rural Development, Ilorin, Kwara State, Nigeria
                            </p>
                            <p style="margin: 0; color: #475569; font-size: 11px;">
                                &copy; 2026 Kwara L-PRES Livestock & Agro Marketplace. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""


# ── 1. WELCOME EMAILS ─────────────────────────────────────────────────────────

def send_welcome_email(user_email: str, user_name: str):
    """Customer Welcome Email"""
    subject = "Welcome to Kwara L-PRES Livestock & Agro Marketplace!"
    body = f"""
    <h3 style="color: #ffffff; font-size: 18px; margin-top: 0;">Hello {user_name}, welcome aboard!</h3>
    <p>
        Thank you for registering on the official <strong>Kwara State L-PRES Enterprise Livestock & Agro Marketplace</strong>.
    </p>
    <p>
        Your account is now active. As a registered marketer, you can browse verified livestock and agro produce, submit enterprise trade requests with 1% veterinary inspection protection, place bids on products, and manage your trade activity.
    </p>
    <div style="background-color: #1e293b; border-left: 4px solid #10b981; padding: 16px; border-radius: 6px; margin: 24px 0;">
        <strong style="color: #10b981; font-size: 14px;">Next Recommended Step:</strong>
        <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 14px;">
            Request official marketer verification in your dashboard to obtain the verified Kwara L-PRES badge and build buyer trust.
        </p>
    </div>
    <p style="margin-bottom: 0;">
        If you have any questions or require enterprise trade facilitation, our team at the State Project Office is here to assist you.
    </p>
    """
    html = get_html_template("Welcome to Kwara L-PRES Marketplace", body, preheader=f"Welcome {user_name} to Kwara L-PRES Marketplace")
    text = f"Hello {user_name}, welcome to Kwara L-PRES Marketplace! Your account is active. Browse products, submit trade requests, and place bids."
    send_resend_email(user_email, subject, html, text)


def send_admin_new_user_alert(user_email: str, user_name: str, user_phone: str, user_lga: str = "Ilorin East"):
    """Admin Notification for New User Registration"""
    admin_target = os.environ.get("ADMIN_EMAIL", ADMIN_EMAIL)
    subject = f"New Marketplace User Registered: {user_name}"
    body = f"""
    <div style="background-color: #1e293b; border-left: 4px solid #38bdf8; padding: 14px; border-radius: 6px; margin-bottom: 20px;">
        <strong style="color: #38bdf8; font-size: 14px;">ADMIN NOTIFICATION</strong> — New Marketer Account Created
    </div>
    <p>A new user has just registered on the Kwara L-PRES Marketplace platform:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #1e293b; border-radius: 8px; overflow: hidden;">
        <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 16px; color: #94a3b8; width: 35%;">Full Name:</td>
            <td style="padding: 10px 16px; color: #ffffff; font-weight: bold;">{user_name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 16px; color: #94a3b8;">Email Address:</td>
            <td style="padding: 10px 16px; color: #38bdf8;">{user_email}</td>
        </tr>
        <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 16px; color: #94a3b8;">Phone Number:</td>
            <td style="padding: 10px 16px; color: #ffffff;">{user_phone}</td>
        </tr>
        <tr>
            <td style="padding: 10px 16px; color: #94a3b8;">LGA / Location:</td>
            <td style="padding: 10px 16px; color: #ffffff;">{user_lga}</td>
        </tr>
    </table>
    <p>You can view and manage user records from the L-PRES Marketplace Admin Dashboard.</p>
    """
    html = get_html_template("New User Registration - Kwara L-PRES", body, preheader=f"New User Registered: {user_name}")
    text = f"Admin Alert: New user {user_name} ({user_email}, Phone: {user_phone}, LGA: {user_lga}) has registered on Kwara L-PRES Marketplace."
    send_resend_email(admin_target, subject, html, text)


# ── 2. TRADE REQUEST EMAILS ───────────────────────────────────────────────────

def send_new_trade_request_email(buyer_email: str, buyer_name: str, request_code: str, product_name: str, total_amount: str):
    """Customer Confirmation Email for Trade Request"""
    subject = f"Trade Request Received [{request_code}] — Kwara L-PRES"
    body = f"""
    <p>Dear {buyer_name},</p>
    <p>
        Your enterprise trade request for <strong>{product_name}</strong> has been successfully registered with Kwara L-PRES State Project Office.
    </p>
    <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; border: 1px solid #334155; margin: 20px 0;">
        <table style="width: 100%; color: #cbd5e1; font-size: 14px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #334155;"><td style="padding: 8px 0; color: #94a3b8;">Request Code:</td><td style="padding: 8px 0;"><strong style="color: #38bdf8;">{request_code}</strong></td></tr>
            <tr style="border-bottom: 1px solid #334155;"><td style="padding: 8px 0; color: #94a3b8;">Item Requested:</td><td style="padding: 8px 0; color: #ffffff;">{product_name}</td></tr>
            <tr style="border-bottom: 1px solid #334155;"><td style="padding: 8px 0; color: #94a3b8;">Estimated Total:</td><td style="padding: 8px 0;"><strong style="color: #10b981;">{total_amount}</strong></td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Status:</td><td style="padding: 8px 0;"><span style="background-color: #eab308; color: #000; padding: 3px 10px; border-radius: 12px; font-weight: bold; font-size: 12px;">Pending Facilitation Review</span></td></tr>
        </table>
    </div>
    <p>
        An official L-PRES trade facilitation officer will verify producer stock availability and contact you shortly.
    </p>
    """
    html = get_html_template(f"Trade Request {request_code}", body, preheader=f"Trade request {request_code} received for {product_name}")
    text = f"Dear {buyer_name}, your trade request {request_code} for {product_name} ({total_amount}) has been received by Kwara L-PRES."
    send_resend_email(buyer_email, subject, html, text)


def send_admin_new_request_alert(buyer_name: str, buyer_email: str, buyer_phone: str, request_code: str, product_name: str, total_amount: str, include_inspection: bool = False):
    """Admin Alert for New Trade Request"""
    admin_target = os.environ.get("ADMIN_EMAIL", ADMIN_EMAIL)
    subject = f"NEW TRADE REQUEST ALERT [{request_code}] — {product_name}"
    inspection_str = "YES (1% Veterinary Inspection Requested)" if include_inspection else "NO"
    body = f"""
    <div style="background-color: #1e293b; border-left: 4px solid #f59e0b; padding: 14px; border-radius: 6px; margin-bottom: 20px;">
        <strong style="color: #f59e0b; font-size: 14px;">ACTION REQUIRED</strong> — New Trade Request Submitted
    </div>
    <p>A new buyer trade request has been placed and requires facilitation review:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #1e293b; border-radius: 8px; overflow: hidden;">
        <tr style="border-bottom: 1px solid #334155;"><td style="padding: 10px 16px; color: #94a3b8; width: 35%;">Request Code:</td><td style="padding: 10px 16px; color: #38bdf8; font-weight: bold;">{request_code}</td></tr>
        <tr style="border-bottom: 1px solid #334155;"><td style="padding: 10px 16px; color: #94a3b8;">Buyer Name:</td><td style="padding: 10px 16px; color: #ffffff;">{buyer_name}</td></tr>
        <tr style="border-bottom: 1px solid #334155;"><td style="padding: 10px 16px; color: #94a3b8;">Buyer Contact:</td><td style="padding: 10px 16px; color: #cbd5e1;">{buyer_email} | {buyer_phone}</td></tr>
        <tr style="border-bottom: 1px solid #334155;"><td style="padding: 10px 16px; color: #94a3b8;">Item:</td><td style="padding: 10px 16px; color: #ffffff;">{product_name}</td></tr>
        <tr style="border-bottom: 1px solid #334155;"><td style="padding: 10px 16px; color: #94a3b8;">Estimated Total:</td><td style="padding: 10px 16px; color: #10b981; font-weight: bold;">{total_amount}</td></tr>
        <tr><td style="padding: 10px 16px; color: #94a3b8;">Inspection Service:</td><td style="padding: 10px 16px; color: #ffffff;">{inspection_str}</td></tr>
    </table>
    <p>Please log in to the Marketplace Admin Portal to process this request.</p>
    """
    html = get_html_template("New Trade Request Alert", body, preheader=f"New trade request {request_code} for {product_name}")
    text = f"Admin Alert: New trade request {request_code} by {buyer_name} for {product_name} ({total_amount}). Contact: {buyer_email} / {buyer_phone}"
    send_resend_email(admin_target, subject, html, text)


def send_request_approved_email(buyer_email: str, buyer_name: str, request_code: str, product_name: str):
    """Customer Notification: Trade Request Approved"""
    subject = f"Trade Request Approved [{request_code}] — Kwara L-PRES"
    body = f"""
    <p>Dear {buyer_name},</p>
    <p>
        Great news! Your trade request for <strong>{product_name}</strong> has been <strong>APPROVED</strong> by the Kwara L-PRES Marketplace Facilitation Team.
    </p>
    <div style="background-color: #064e3b; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #a7f3d0; margin: 0; font-weight: bold; font-size: 16px;">Status: Approved / Facilitation Active</p>
        <p style="color: #cbd5e1; font-size: 14px; margin-top: 8px; margin-bottom: 0;">
            Our logistics & veterinary inspection team is coordinating stock release and haulage with the producer.
        </p>
    </div>
    <p>You will receive another update as soon as logistics haulage commences.</p>
    """
    html = get_html_template(f"Trade Request Approved {request_code}", body, preheader=f"Trade request {request_code} approved")
    text = f"Dear {buyer_name}, your trade request {request_code} for {product_name} has been APPROVED by Kwara L-PRES."
    send_resend_email(buyer_email, subject, html, text)


def send_request_shipped_email(buyer_email: str, buyer_name: str, request_code: str, product_name: str, admin_notes: str = ""):
    """Customer Notification: Request Shipped / Dispatched"""
    subject = f"Order Dispatched / Shipped [{request_code}] — Kwara L-PRES"
    notes_block = f"""
    <div style="background-color: #1e293b; padding: 14px; border-radius: 6px; margin-top: 12px;">
        <strong style="color: #38bdf8;">Dispatch Note from Admin:</strong>
        <p style="color: #e2e8f0; margin: 4px 0 0 0;">{admin_notes}</p>
    </div>
    """ if admin_notes else ""

    body = f"""
    <p>Dear {buyer_name},</p>
    <p>
        Your order of <strong>{product_name}</strong> is now in transit / shipped to your delivery location!
    </p>
    <div style="background-color: #0c4a6e; border: 1px solid #38bdf8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #bae6fd; margin: 0; font-weight: bold; font-size: 16px;">Status: Dispatched / In Transit</p>
        <p style="color: #e0f2fe; font-size: 14px; margin-top: 8px; margin-bottom: 0;">
            L-PRES haulage team is delivering your shipment. Please ensure your contact phone is reachable.
        </p>
        {notes_block}
    </div>
    <p>Upon receipt and quality check, please confirm receipt to finalize escrow release.</p>
    """
    html = get_html_template(f"Order Shipped {request_code}", body, preheader=f"Order {request_code} for {product_name} shipped")
    text = f"Dear {buyer_name}, your order {request_code} for {product_name} has been SHIPPED. Notes: {admin_notes}"
    send_resend_email(buyer_email, subject, html, text)


# ── 3. BID EMAILS ─────────────────────────────────────────────────────────────

def send_new_bid_email(bidder_email: str, bidder_name: str, bid_code: str, product_name: str, bid_amount: str, quantity: str = "1", notes: str = ""):
    """Sent to Bidder and Admin when a new Bid is placed"""
    subject = f"Bid Submitted [{bid_code}] — Kwara L-PRES Marketplace"
    body = f"""
    <p>Dear {bidder_name},</p>
    <p>
        Your bid on <strong>{product_name}</strong> has been successfully submitted to Kwara L-PRES Marketplace.
    </p>
    <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; border: 1px solid #334155; margin: 20px 0;">
        <table style="width: 100%; color: #cbd5e1; font-size: 14px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #334155;"><td style="padding: 8px 0; color: #94a3b8;">Bid Code:</td><td style="padding: 8px 0;"><strong style="color: #38bdf8;">{bid_code}</strong></td></tr>
            <tr style="border-bottom: 1px solid #334155;"><td style="padding: 8px 0; color: #94a3b8;">Item Name:</td><td style="padding: 8px 0; color: #ffffff;">{product_name}</td></tr>
            <tr style="border-bottom: 1px solid #334155;"><td style="padding: 8px 0; color: #94a3b8;">Offered Quantity:</td><td style="padding: 8px 0; color: #ffffff;">{quantity}</td></tr>
            <tr style="border-bottom: 1px solid #334155;"><td style="padding: 8px 0; color: #94a3b8;">Your Bid Amount:</td><td style="padding: 8px 0;"><strong style="color: #10b981; font-size: 16px;">{bid_amount}</strong></td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Status:</td><td style="padding: 8px 0;"><span style="background-color: #eab308; color: #000; padding: 3px 10px; border-radius: 12px; font-weight: bold; font-size: 12px;">Pending Review</span></td></tr>
        </table>
        {f'<p style="color: #94a3b8; font-size: 13px; margin: 12px 0 0 0;"><strong>Notes:</strong> {notes}</p>' if notes else ''}
    </div>
    <p>
        The seller and L-PRES trade team will evaluate your bid. You will be notified immediately when a decision is made.
    </p>
    """
    html = get_html_template(f"Bid Confirmation {bid_code}", body, preheader=f"Bid {bid_code} submitted for {product_name}")
    text = f"Dear {bidder_name}, your bid {bid_code} ({bid_amount}) for {product_name} was received and is under review."
    send_resend_email(bidder_email, subject, html, text)

    # Also send alert to admin
    admin_target = os.environ.get("ADMIN_EMAIL", ADMIN_EMAIL)
    admin_subject = f"NEW BID PLACED [{bid_code}] — {product_name} ({bid_amount})"
    admin_body = f"""
    <div style="background-color: #1e293b; border-left: 4px solid #10b981; padding: 14px; border-radius: 6px; margin-bottom: 20px;">
        <strong style="color: #10b981; font-size: 14px;">ADMIN BID NOTIFICATION</strong> — New Offer Received
    </div>
    <p>A new customer bid has been placed:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #1e293b; border-radius: 8px; overflow: hidden;">
        <tr style="border-bottom: 1px solid #334155;"><td style="padding: 10px 16px; color: #94a3b8; width: 35%;">Bid Code:</td><td style="padding: 10px 16px; color: #38bdf8; font-weight: bold;">{bid_code}</td></tr>
        <tr style="border-bottom: 1px solid #334155;"><td style="padding: 10px 16px; color: #94a3b8;">Bidder Name:</td><td style="padding: 10px 16px; color: #ffffff;">{bidder_name}</td></tr>
        <tr style="border-bottom: 1px solid #334155;"><td style="padding: 10px 16px; color: #94a3b8;">Bidder Email:</td><td style="padding: 10px 16px; color: #38bdf8;">{bidder_email}</td></tr>
        <tr style="border-bottom: 1px solid #334155;"><td style="padding: 10px 16px; color: #94a3b8;">Product:</td><td style="padding: 10px 16px; color: #ffffff;">{product_name}</td></tr>
        <tr style="border-bottom: 1px solid #334155;"><td style="padding: 10px 16px; color: #94a3b8;">Bid Amount:</td><td style="padding: 10px 16px; color: #10b981; font-weight: bold;">{bid_amount}</td></tr>
        <tr><td style="padding: 10px 16px; color: #94a3b8;">Quantity:</td><td style="padding: 10px 16px; color: #ffffff;">{quantity}</td></tr>
    </table>
    <p>Log in to the Admin Dashboard to Accept or Reject this bid.</p>
    """
    admin_html = get_html_template("New Bid Alert", admin_body, preheader=f"New bid {bid_code} for {product_name}")
    send_resend_email(admin_target, admin_subject, admin_html, f"Admin Alert: New Bid {bid_code} by {bidder_name} on {product_name} ({bid_amount})")


def send_bid_accepted_email(bidder_email: str, bidder_name: str, bid_code: str, product_name: str, bid_amount: str, admin_notes: str = ""):
    """Customer Notification: Bid ACCEPTED"""
    subject = f"CONGRATULATIONS! Your Bid Has Been ACCEPTED [{bid_code}] — Kwara L-PRES"
    notes_block = f"""
    <div style="background-color: #065f46; padding: 14px; border-radius: 6px; margin-top: 14px;">
        <strong style="color: #a7f3d0;">Seller / Admin Facilitation Notes:</strong>
        <p style="color: #ffffff; margin: 4px 0 0 0;">{admin_notes}</p>
    </div>
    """ if admin_notes else ""

    body = f"""
    <p>Dear {bidder_name},</p>
    <p>
        Great news! Your bid for <strong>{product_name}</strong> at <strong>{bid_amount}</strong> has been <strong style="color: #10b981;">ACCEPTED</strong>!
    </p>
    <div style="background-color: #064e3b; border: 2px solid #10b981; padding: 22px; border-radius: 10px; margin: 20px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <h4 style="color: #ffffff; margin: 0; font-size: 18px;">Status: BID ACCEPTED</h4>
            <span style="background-color: #10b981; color: #000; padding: 4px 12px; border-radius: 16px; font-weight: bold; font-size: 13px;">CONFIRMED</span>
        </div>
        <p style="color: #cbd5e1; font-size: 14px; margin-top: 10px; margin-bottom: 0;">
            Bid Reference Code: <strong style="color: #ffffff;">{bid_code}</strong><br>
            Agreed Bid Price: <strong style="color: #a7f3d0; font-size: 16px;">{bid_amount}</strong>
        </p>
        {notes_block}
    </div>
    <div style="background-color: #1e293b; padding: 16px; border-radius: 6px; border-left: 4px solid #38bdf8;">
        <strong style="color: #38bdf8;">Next Steps:</strong>
        <p style="margin: 6px 0 0 0; color: #cbd5e1; font-size: 14px;">
            An L-PRES Trade Facilitation officer will reach out to you via phone/email to organize secure escrow payment and arrange item haulage & veterinary inspection.
        </p>
    </div>
    """
    html = get_html_template(f"Bid Accepted {bid_code}", body, preheader=f"Your bid {bid_code} for {product_name} was ACCEPTED!")
    text = f"Congratulations {bidder_name}! Your bid {bid_code} ({bid_amount}) for {product_name} was ACCEPTED by Kwara L-PRES."
    send_resend_email(bidder_email, subject, html, text)


def send_bid_rejected_email(bidder_email: str, bidder_name: str, bid_code: str, product_name: str, bid_amount: str, reason: str = ""):
    """Customer Notification: Bid REJECTED"""
    subject = f"Bid Decision Update [{bid_code}] — Kwara L-PRES Marketplace"
    reason_block = f"""
    <div style="background-color: #450a0a; border: 1px solid #ef4444; padding: 14px; border-radius: 6px; margin-top: 14px;">
        <strong style="color: #fca5a5;">Reason / Seller Feedback:</strong>
        <p style="color: #fecdd3; margin: 4px 0 0 0;">{reason}</p>
    </div>
    """ if reason else ""

    body = f"""
    <p>Dear {bidder_name},</p>
    <p>
        Thank you for submitting your offer on <strong>{product_name}</strong>.
    </p>
    <p>
        After reviewing current market stock and reserve pricing, your bid of <strong>{bid_amount}</strong> (Code: <code>{bid_code}</code>) was <strong style="color: #ef4444;">NOT ACCEPTED</strong> at this time.
    </p>
    <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; border: 1px solid #334155; margin: 20px 0;">
        <p style="color: #f87171; margin: 0; font-weight: bold; font-size: 15px;">Status: Bid Declined / Rejected</p>
        {reason_block}
    </div>
    <div style="background-color: #0f172a; padding: 16px; border-radius: 6px; border-left: 4px solid #eab308;">
        <strong style="color: #eab308;">What you can do:</strong>
        <p style="margin: 6px 0 0 0; color: #cbd5e1; font-size: 14px;">
            You are welcome to submit a revised bid or explore alternative verified livestock listings on the Kwara L-PRES Marketplace.
        </p>
    </div>
    """
    html = get_html_template(f"Bid Update {bid_code}", body, preheader=f"Update on your bid {bid_code} for {product_name}")
    text = f"Dear {bidder_name}, your bid {bid_code} ({bid_amount}) for {product_name} was not accepted. Feedback: {reason}"
    send_resend_email(bidder_email, subject, html, text)
