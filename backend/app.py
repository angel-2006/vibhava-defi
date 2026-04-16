from pydantic import BaseModel
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import random
import uuid

app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- LOAD DATASET SAFELY ----------------
file_path = os.path.join(os.path.dirname(__file__), "dataset.csv")
df = pd.read_csv(file_path)

# --- IN-MEMORY DATABASES ---
current_user = None
users_db = {}                
stakes = {}                  
community_stakes = []        
active_loan_requests = {}    
loans = [] # Stores detailed official loan contracts                

# ---------------- SCHEMAS ----------------
class LoginRequest(BaseModel):
    username: str
    password: str
    user_type: str

class LendRequest(BaseModel):
    borrower: dict
    amount: int

class StakeReqBody(BaseModel):
    target_user_id: int
    amount: int

class ApplyLoanRequest(BaseModel):
    amount: int
    collateral: str
    duration_months: int  

# ---------------- CREDIT SCORE FORMULA ----------------
def calculate_score(data, user_type="regular"):
    score = (
        data["monthly_income"] * 0.25 +
        data["upi_txn_count"] * 1.5 +
        data["upi_inflow_outflow_ratio"] * 100 +
        data["savings_ratio"] * 300 +
        data["gst_filing_frequency"] * 20 -
        data["missed_payments"] * 80 -
        data["income_variance"] * 100
    )
    if user_type == "student": score += 50
    elif user_type == "farmer": score += 30
    return score

def federated_score(user):
    clients = [df.iloc[:2], df.iloc[2:4], df.iloc[4:]]
    local_scores = [calculate_score(c.iloc[0]) for c in clients]
    global_model = sum(local_scores) / len(local_scores)
    user_score = calculate_score(user, user.get("user_type", "regular"))
    return (user_score + global_model) / 2

def normalize_score(score): return max(300, min(int(score / 20), 900))
def get_risk(score):
    if score > 700: return "Low"
    elif score > 600: return "Medium"
    else: return "High"

def get_dynamic_interest_rate(score):
    if score > 700: rate = 12.0 - ((score - 700) / 200.0) * 2.0
    elif score > 600: rate = 20.0 - ((score - 600) / 100.0) * 8.0
    else:
        clamped_score = max(300, score)
        rate = 26.0 - ((clamped_score - 300) / 300.0) * 6.0
    return round(rate, 2)

# ---------------- LOGIN ----------------
@app.post("/login")
def login(req: LoginRequest):
    global current_user
    if req.username in users_db:
        if users_db[req.username]["password"] != req.password:
            raise HTTPException(status_code=401, detail="Invalid password")
        current_user = users_db[req.username]
    else:
        user_data = df.sample().iloc[0].to_dict()
        user_data["username"] = req.username
        user_data["password"] = req.password
        user_data["user_type"] = req.user_type
        user_data["user_id"] = int(user_data["user_id"]) 
        users_db[req.username] = user_data
        current_user = user_data
    return current_user

# ---------------- SCORE & ELIGIBILITY ----------------
@app.get("/score")
def get_score():
    base = federated_score(current_user)
    final_score = normalize_score(base + (stakes.get(current_user["user_id"], 0) * 0.01))
    return {"score": final_score, "risk": get_risk(final_score)}

@app.get("/loan_eligibility")
def loan_eligibility():
    base = federated_score(current_user)
    final_score = normalize_score(base)
    if final_score > 700: max_loan = 50000
    elif final_score > 600: max_loan = 20000
    else: max_loan = 5000
    return {"max_loan": max_loan}

# ---------------- EXPLICIT LOAN APPLICATION ----------------
@app.post("/apply_loan")
def apply_loan(req: ApplyLoanRequest):
    if current_user is None: return {"error": "Not logged in"}
    
    user_id = current_user["user_id"]
    base = federated_score(current_user)
    collateral_bonus = {"None": 0, "Digital Asset": 30, "Vehicle": 50, "Land Record": 80}.get(req.collateral, 0)
    
    active_loan_requests[user_id] = {
        "user_id": user_id,
        "name": current_user.get("username", f"User_{user_id}"),
        "requested_amount": req.amount,
        "collateral": req.collateral,
        "duration_months": req.duration_months,
        "base_credit_score": normalize_score(base + collateral_bonus),
        "reason": current_user.get("reason", "Business expansion / Education")
    }
    return {"message": "Loan request submitted successfully."}

# ---------------- STAKE (Community) ----------------
@app.post("/stake")
def stake(req: StakeReqBody):
    if current_user is None: return {"error": "Not logged in"}
    
    community_stakes.append({
        "staker_id": current_user.get("user_id", "unknown"),
        "borrower_id": req.target_user_id,
        "amount": req.amount
    })
    stakes[req.target_user_id] = stakes.get(req.target_user_id, 0) + req.amount
    return {"message": f"Successfully staked ₹{req.amount} on User {req.target_user_id}"}

# ---------------- BORROWERS LIST (MARKET) ----------------
@app.get("/borrowers")
def get_borrowers():
    borrowers_list = []
    for uid, req in active_loan_requests.items():
        b = req.copy()
        comm_collat = sum(s["amount"] for s in community_stakes if s["borrower_id"] == uid)
        b["community_collateral"] = comm_collat
        
        bonus_pts = int(min(1.0, comm_collat / max(1, b["requested_amount"])) * 200)
        eff_score = normalize_score(b["base_credit_score"] + bonus_pts)
        
        b["calculated_credit_score"] = eff_score
        b["interest_rate"] = get_dynamic_interest_rate(eff_score)
        b["community_bonus_points"] = bonus_pts
        borrowers_list.append(b)
    return borrowers_list

# ---------------- LEND (FUNDING) ----------------
@app.post("/lend")
def lend(data: LendRequest):
    global current_user
    if current_user is None: return {"error": "User not logged in"}

    b_id = data.borrower.get("user_id")
    if b_id not in active_loan_requests:
        return {"error": "Loan request no longer active."}

    # Fetch dynamic calculated values directly from the market feed
    market_data = [b for b in get_borrowers() if b["user_id"] == b_id][0]
    
    P = market_data["requested_amount"]
    R = (market_data["interest_rate"] / 100) / 12
    N = market_data["duration_months"]
    emi = P * R * ((1 + R)**N) / (((1 + R)**N) - 1)
    total_payable = emi * N

    # Register the official loan contract
    loan_contract = {
        "loan_id": str(uuid.uuid4())[:8],
        "lender_id": current_user["user_id"],
        "borrower_id": b_id,
        "principal": P,
        "duration": N,
        "interest_rate": market_data["interest_rate"],
        "emi": round(emi),
        "total_payable": round(total_payable),
        "amount_paid": 0,
        "status": "Active" # Changes to 'Resolved' upon full repayment
    }
    loans.append(loan_contract)
    del active_loan_requests[b_id] # Remove from market

    return {"message": "Funding successful", "loan": loan_contract}

# ---------------- MY LOANS (BORROWER DASHBOARD) ----------------
@app.get("/my_loans")
def get_my_loans():
    if current_user is None: return []
    uid = current_user["user_id"]
    return [l for l in loans if l["borrower_id"] == uid]

# ---------------- REPAY EMI ----------------
@app.post("/repay/{loan_id}")
def repay_loan(loan_id: str):
    if current_user is None: return {"error": "Not logged in"}
    
    for l in loans:
        if l["loan_id"] == loan_id and l["borrower_id"] == current_user["user_id"]:
            if l["status"] == "Resolved":
                return {"error": "Loan already paid off"}
            
            l["amount_paid"] += l["emi"]
            
            # Check if fully paid
            if l["amount_paid"] >= l["total_payable"]:
                l["amount_paid"] = l["total_payable"]
                l["status"] = "Resolved"
                
            return {"message": f"EMI of ₹{l['emi']} paid successfully!", "loan": l}
            
    return {"error": "Loan not found or unauthorized"}