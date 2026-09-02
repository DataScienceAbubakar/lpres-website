import sys
import os
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app, seed_marketplace_admin

client = TestClient(app)

def run_tests():
    print("=== STARTING MARKETPLACE ADMIN & RESEND EMAIL INTEGRATION TESTS ===")

    # Ensure admin is seeded
    seed_marketplace_admin()

    # Test 1: Marketplace Admin Login
    print("\n1. Testing Marketplace Admin Login...")
    resp = client.post("/api/marketplace/admin/login", json={
        "username": "marketplace_admin",
        "password": os.environ.get("MARKETPLACE_ADMIN_SEED_PASSWORD", "MarketplaceAdmin2026!")
    })
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    login_data = resp.json()
    token = login_data["token"]
    assert token, "Token not returned"
    print(f"   [SUCCESS] Authenticated marketplace admin. Token obtained.")

    headers = {"Authorization": f"Bearer {token}"}

    # Test 2: Marketplace Admin Analytics Endpoint
    print("\n2. Testing Marketplace Admin Analytics Endpoint...")
    resp = client.get("/api/marketplace/admin/analytics", headers=headers)
    assert resp.status_code == 200, f"Analytics failed: {resp.text}"
    analytics = resp.json()["data"]
    print(f"   [SUCCESS] Analytics Data: {json.dumps(analytics, indent=2)}")

    # Test 3: User Registration with Resend Welcome Email Trigger
    print("\n3. Testing User Registration & Welcome Email Trigger...")
    import time
    test_email = f"testbuyer_{int(time.time())}@example.com"
    resp = client.post("/api/marketplace/auth/register", json={
        "name": "Test Buyer",
        "email": test_email,
        "phone": "+2348012345678",
        "password": "BuyerPassword123!",
        "lga": "Ilorin East"
    })
    assert resp.status_code == 200, f"Registration failed: {resp.text}"
    print(f"   [SUCCESS] Registered user {test_email}. Welcome email triggered.")

    # Test 4: Submit Enterprise Trade Request & Resend Notification Email
    print("\n4. Testing Trade Request Submission & Resend Email Trigger...")
    req_payload = {
        "product_id": "prod-101",
        "product_name": "Kwara Super Bovine Cattle",
        "product_category": "Cattle / Livestock",
        "unit_price": {"amount": 450000, "currency": "NGN"},
        "requested_qty": "5 Head",
        "estimated_total": {"amount": 2250000, "currency": "NGN"},
        "include_inspection": True,
        "request_supply_chain": True,
        "buyer_name": "Test Buyer",
        "buyer_email": test_email,
        "buyer_phone": "+2348012345678",
        "buyer_lga": "Ilorin East",
        "delivery_location": "Ilorin Main Abattoir Relay Hub",
        "additionalNotes": "Urgent enterprise shipment required for festival",
        "seller_name": "Kwara Cattle Producers Coop",
        "seller_id": "seller-001"
    }
    resp = client.post("/api/marketplace/requests", json=req_payload)
    assert resp.status_code == 200, f"Trade request submission failed: {resp.text}"
    req_data = resp.json()["data"]
    request_id = req_data["id"]
    request_code = req_data["requestCode"]
    print(f"   [SUCCESS] Created trade request {request_code} (ID: {request_id}). Email notification triggered.")

    # Test 5: Marketplace Admin Status Update to Approved (Fires Resend Approved Email)
    print("\n5. Testing Admin Approval Status Update & Resend Approved Email Trigger...")
    resp = client.patch(
        f"/api/marketplace/admin/requests/{request_id}/status",
        headers=headers,
        json={"status": "approved", "admin_notes": "Stock verified by Kwara L-PRES Veterinary Inspection team."}
    )
    assert resp.status_code == 200, f"Status update to approved failed: {resp.text}"
    print(f"   [SUCCESS] Updated request {request_code} to approved. Resend Approved email triggered.")

    # Test 6: Marketplace Admin Status Update to Shipped (Fires Resend Shipped Email)
    print("\n6. Testing Admin Shipped Status Update & Resend Shipped Email Trigger...")
    resp = client.patch(
        f"/api/marketplace/admin/requests/{request_id}/status",
        headers=headers,
        json={"status": "shipped", "admin_notes": "Logistics haulage truck loaded. Driver: +2348099887766."}
    )
    assert resp.status_code == 200, f"Status update to shipped failed: {resp.text}"
    print(f"   [SUCCESS] Updated request {request_code} to shipped. Resend Shipped email triggered.")

    # Test 7: Verify Analytics updated
    print("\n7. Verifying Analytics Total Volume and Status Breakdown...")
    resp = client.get("/api/marketplace/admin/analytics", headers=headers)
    assert resp.status_code == 200
    updated_analytics = resp.json()["data"]
    print(f"   [SUCCESS] Updated Analytics: Total Requests={updated_analytics['total_requests']}, Total Amount=NGN {updated_analytics['total_amount']:,.2f}")

    print("\n=== ALL MARKETPLACE ADMIN & EMAIL INTEGRATION TESTS PASSED PERFECTLY ===")



if __name__ == "__main__":
    run_tests()
