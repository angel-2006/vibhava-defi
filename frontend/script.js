// Production build
const API = "hhttps://vibhava-backend.onrender.com";

// ================= WEB3 & METAMASK SETUP =================
const CONTRACT_ADDRESS = "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8";
const CONTRACT_ABI = [
    {
        "anonymous": false,
        "inputs": [{ "indexed": false, "internalType": "uint256", "name": "loanId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "staker", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }],
        "name": "CommunityStaked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{ "indexed": false, "internalType": "uint256", "name": "loanId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }],
        "name": "EMIPaid",
        "type": "event"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_loanId", "type": "uint256" }],
        "name": "fundLoan",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [{ "indexed": false, "internalType": "uint256", "name": "loanId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "lender", "type": "address" }],
        "name": "LoanFunded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{ "indexed": false, "internalType": "uint256", "name": "loanId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "borrower", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "principal", "type": "uint256" }],
        "name": "LoanRequested",
        "type": "event"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_loanId", "type": "uint256" }],
        "name": "payEMI",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_principal", "type": "uint256" }, { "internalType": "uint256", "name": "_emiAmount", "type": "uint256" }, { "internalType": "uint256", "name": "_totalPayable", "type": "uint256" }],
        "name": "requestLoan",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_loanId", "type": "uint256" }],
        "name": "stakeCollateral",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "loanCounter",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "name": "loans",
        "outputs": [
            { "internalType": "uint256", "name": "id", "type": "uint256" },
            { "internalType": "address payable", "name": "borrower", "type": "address" },
            { "internalType": "address payable", "name": "lender", "type": "address" },
            { "internalType": "uint256", "name": "principal", "type": "uint256" },
            { "internalType": "uint256", "name": "emiAmount", "type": "uint256" },
            { "internalType": "uint256", "name": "totalPayable", "type": "uint256" },
            { "internalType": "uint256", "name": "amountPaid", "type": "uint256" },
            { "internalType": "uint256", "name": "communityCollateral", "type": "uint256" },
            { "internalType": "bool", "name": "isFunded", "type": "bool" },
            { "internalType": "bool", "name": "isResolved", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "", "type": "address" }],
        "name": "stakes",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];

let provider, signer, smartContract;
let currentRiskAppetite = 'stable'; // Default to stable only

function updateStatus(message, isError = false) {
    const resDiv = document.getElementById("result");
    if (!resDiv) return;
    resDiv.innerHTML = `<p style="color: ${isError ? '#ef4444' : '#10b981'}; font-weight:600; font-size:14px; margin-top:10px;">${message}</p>`;
}

async function connectWallet() {
    if (window.ethereum) {
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            smartContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            let address = await signer.getAddress();
            const btn = document.getElementById("walletStatus");
            btn.innerText = "🦊 " + address.substring(0,6) + "..." + address.substring(38);
            btn.style.background = "#10b981";
            updateStatus("Wallet Linked Successfully!");
        } catch (err) {
            updateStatus("Connection Rejected", true);
        }
    } else {
        alert("Please install MetaMask!");
    }
}

function inrToWei(inrAmount) {
    let ethAmount = (inrAmount * 0.0000001).toFixed(18); 
    return ethers.utils.parseEther(ethAmount.toString());
}

// ================= LOGIN / LOGOUT =================
async function goToFetch() {
    let username = document.getElementById("usernameInput").value;
    let password = document.getElementById("passwordInput").value;
    let userType = document.getElementById("userTypeInput").value;

    if (!username || !password) return alert("Enter credentials");

    try {
        let res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, user_type: userType })
        });
        if (!res.ok) throw new Error();
        let user = await res.json();
        localStorage.setItem("user", JSON.stringify(user));

        document.getElementById("loginScreen").classList.add("hidden");
        document.getElementById("fetchScreen").classList.remove("hidden");
    } catch { 
        document.getElementById("loginMessage").innerText = "Invalid Login or Backend Offline";
        document.getElementById("loginMessage").style.color = "#ef4444";
    }
}

function logout() {
    localStorage.clear();
    document.getElementById("profileScreen").classList.add("hidden");
    document.getElementById("loginScreen").classList.remove("hidden");
}

function fetchUser() {
    let user = JSON.parse(localStorage.getItem("user"));
    if (!user) return logout();
    document.getElementById("fetchScreen").classList.add("hidden");
    document.getElementById("profileScreen").classList.remove("hidden");
    document.getElementById("usernameTop").innerText = user.username.toUpperCase() + " • ID: " + user.user_id;
    showBorrower();
}

// ================= BORROWER DASHBOARD =================
function showBorrower() {
    document.getElementById("profile").innerHTML = "";
    let user = JSON.parse(localStorage.getItem("user"));

    document.getElementById("profile").innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:25px;">
            <div>
                <h2 style="margin:0;">Borrower Dashboard</h2>
                <p style="color:var(--primary); font-size:13px; font-weight:600; margin-top:5px;">Role: ${user.user_type.toUpperCase()}</p>
            </div>
            <button id="walletStatus" onclick="connectWallet()" style="background:#334155; font-size:12px; padding:8px 15px;">🦊 Connect Wallet</button>
        </div>
        
        <div class="glass-card" style="padding:20px; display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:25px; text-align:left;">
            <div><label style="font-size:11px; color:var(--text-muted)">MONTHLY INCOME</label><p style="margin:0; font-weight:600;">₹${user.monthly_income}</p></div>
            <div><label style="font-size:11px; color:var(--text-muted)">UPI TRANSACTIONS</label><p style="margin:0; font-weight:600;">${user.upi_txn_count}</p></div>
            <div><label style="font-size:11px; color:var(--text-muted)">SAVINGS RATIO</label><p style="margin:0; font-weight:600;">${user.savings_ratio}</p></div>
            <div><label style="font-size:11px; color:var(--text-muted)">USER STATUS</label><p style="margin:0; font-weight:600; color:#10b981;">Verified</p></div>
        </div>

        <div style="display:flex; gap:15px; margin-bottom:25px;">
            <button onclick="getScore()" style="flex:1; background:rgba(255,255,255,0.1); box-shadow:none;">Check Credit Score</button>
            <button onclick="openLoanForm()" style="flex:1; background:#10b981;">Apply for Loan</button>
        </div>

        <div id="result"></div>
        
        <h3 style="text-align:left; margin-top:30px; font-size:18px;">Active Loan Ledger</h3>
        <div id="myLoansContainer">Loading active contracts...</div>
    `;
    loadMyLoans();
}

async function loadMyLoans() {
    let res = await fetch(`${API}/my_loans`);
    let loans = await res.json();
    let container = document.getElementById("myLoansContainer");

    if (loans.length === 0) {
        container.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-muted);">No loan history found on this account.</div>`;
        return;
    }

    let html = "";
    loans.forEach(l => {
        let isResolved = l.status === "Resolved";
        let progress = Math.round((l.amount_paid / l.total_payable) * 100);

        html += `
            <div class="loan-card" style="margin-bottom:15px; text-align:left; padding:20px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                    <div>
                        <span style="font-size:11px; color:var(--text-muted)">PRINCIPAL AMOUNT</span>
                        <p style="margin:0; font-size:18px; font-weight:700;">₹${l.principal}</p>
                    </div>
                    <span style="background:${isResolved ? '#10b981' : '#f59e0b'}; height:fit-content; padding:4px 12px; border-radius:50px; font-size:11px; font-weight:700;">${l.status.toUpperCase()}</span>
                </div>
                <div style="background:rgba(255,255,255,0.05); height:6px; border-radius:10px; margin-bottom:8px;">
                    <div style="background:var(--primary); height:100%; width:${progress}%; border-radius:10px; box-shadow:0 0 10px var(--primary);"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:15px;">
                    <span>Repaid: ₹${l.amount_paid}</span>
                    <span>Total: ₹${l.total_payable}</span>
                </div>
                ${!isResolved ? `<button onclick="payEmi('${l.loan_id}', ${l.borrower_id}, ${l.emi})" style="width:100%; font-size:13px;">Pay Monthly EMI (₹${l.emi})</button>` : ''}
            </div>
        `;
    });
    container.innerHTML = html;
}

// ---------------- WEB3: Pay EMI ----------------
async function payEmi(loanId, borrowerId, emiAmount) {
    if (!smartContract) return updateStatus("Connect MetaMask first", true);
    updateStatus("Processing Payment Request...");

    try {
        let valueInWei = inrToWei(emiAmount);
        let tx = await smartContract.payEMI(borrowerId, { value: valueInWei });
        updateStatus("Transaction Submitted. Waiting for Block...");
        await tx.wait();

        await fetch(`${API}/repay/${loanId}`, { method: "POST" });
        updateStatus("EMI Repaid Successfully!");
        loadMyLoans(); 
    } catch (err) {
        updateStatus("Transaction Cancelled or Failed", true);
    }
}

// ================= LOAN LOGIC =================
async function getScore() {
    let res = await fetch(`${API}/score`);
    let data = await res.json();
    document.getElementById("result").innerHTML = `
        <div class="glass-card" style="border-color:var(--primary); text-align:center;">
            <p style="color:var(--text-muted); font-size:12px; margin-bottom:5px;">AI-GENERATED CREDIT SCORE</p>
            <h2 style="font-size:36px; margin:0;">${data.score}</h2>
            <p style="margin:10px 0 0 0; font-weight:600; color:${data.risk === 'High Risk' ? '#ef4444' : '#10b981'}">${data.risk.toUpperCase()}</p>
        </div>
    `;
}

async function openLoanForm() {
    let res = await fetch(`${API}/loan_eligibility`);
    let data = await res.json();
    document.getElementById("result").innerHTML = `
        <div class="glass-card" style="text-align:left;">
            <h3 style="font-size:16px;">New Loan Application</h3>
            <p style="color:var(--text-muted); font-size:13px;">Eligible Limit: <b>₹${data.max_loan}</b></p>
            
            <input id="reqLoanAmount" type="number" placeholder="Enter Amount (INR)" max="${data.max_loan}">
            <select id="reqDuration">
                <option value="6">6 Months Term</option>
                <option value="12" selected>12 Months Term</option>
                <option value="24">24 Months Term</option>
            </select>
            <select id="reqCollateral">
                <option value="None">No Collateral</option>
                <option value="Digital Asset">Digital Asset (NFT/Crypto)</option>
                <option value="Vehicle">Vehicle RC</option>
                <option value="Land Record">Land Record</option>
            </select>
            <button onclick="submitLoan()" style="width:100%; margin-top:10px;">Register Contract on Blockchain</button>
        </div>
    `;
}

async function submitLoan() {
    let amount = document.getElementById("reqLoanAmount").value;
    let duration = document.getElementById("reqDuration").value;
    let collateral = document.getElementById("reqCollateral").value;
    
    if (!amount || amount <= 0) return updateStatus("Invalid Amount", true);
    if (!smartContract) return updateStatus("Connect MetaMask", true);

    updateStatus("Deploying Contract to Sepolia...");

    try {
        let P = parseInt(amount), N = parseInt(duration), R = 0.12 / 12; 
        let baseEmi = Math.round(P * R * (Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1));
        let baseTotal = baseEmi * N;

        let tx = await smartContract.requestLoan(P, baseEmi, baseTotal);
        await tx.wait();

        await fetch(`${API}/apply_loan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: P, duration_months: N, collateral: collateral })
        });
        
        updateStatus("Application Secured on Blockchain!");
        setTimeout(showBorrower, 2000);
    } catch (err) {
        updateStatus("Deployment Failed", true);
    }
}

// ================= LENDER DASHBOARD WITH FILTER =================

// Helper to switch risk appetite
function setRiskAppetite(appetite) {
    currentRiskAppetite = appetite;
    showLender(); // Re-render the dashboard to apply the filter
}

async function showLender() {
    document.getElementById("profile").innerHTML = "";
    let lender = JSON.parse(localStorage.getItem("user"));

    let res = await fetch(`${API}/borrowers`);
    let data = await res.json();
    localStorage.setItem("borrowers", JSON.stringify(data));

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h2>Investment Market</h2>
            <button id="walletStatus" onclick="connectWallet()" style="background:#334155; font-size:12px; padding:8px 15px;">🦊 Connect Wallet</button>
        </div>

        <div class="risk-appetite-container">
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 600; letter-spacing: 1px;">YOUR RISK APPETITE</span>
            <div class="risk-toggle">
                <button id="riskStable" 
                    class="${currentRiskAppetite === 'stable' ? 'active-stable' : ''}" 
                    onclick="setRiskAppetite('stable')">🛡️ STABLE ONLY</button>
                <button id="riskAggressive" 
                    class="${currentRiskAppetite === 'aggressive' ? 'active-aggressive' : ''}" 
                    onclick="setRiskAppetite('aggressive')">🔥 AGGRESSIVE (ALL)</button>
            </div>
        </div>
    `;

    let htmlCards = "";
    let displayCount = 0;
    let lenderIncome = lender.monthly_income;

    // Loop through all data but only display what matches the filter
    data.forEach((b, originalIndex) => {
        let P = b.requested_amount;
        let isHighRisk = P > (lenderIncome * 2);
        
        // FILTER LOGIC: If set to 'stable', skip high risk profiles (Exceeds 2x Income)
        if (currentRiskAppetite === 'stable' && isHighRisk) {
            return; 
        }

        displayCount++;

        // Calculate detail data
        let R = (b.interest_rate / 100) / 12, N = b.duration_months;
        let emi = Math.round(P * R * (Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1));
        let totalInterest = Math.round((emi * N) - P);

        // Incorporating User's 3-Tier Risk Badge Logic
        let riskBadge = "";
        let borderLeftColor = "";

        if (P > (lenderIncome * 2)) {
            riskBadge = `<span style="background:#ef4444; color:white; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:bold;">🔴 High Risk (Exceeds 2x Income)</span>`;
            borderLeftColor = "#ef4444";
        } else if (P > lenderIncome) {
            riskBadge = `<span style="background:#f59e0b; color:white; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:bold;">🟠 Moderate Risk</span>`;
            borderLeftColor = "#f59e0b";
        } else {
            riskBadge = `<span style="background:#10b981; color:white; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:bold;">🟢 Safe (Within Income)</span>`;
            borderLeftColor = "#10b981";
        }

        htmlCards += `
            <div class="glass-card" style="margin-bottom:15px; text-align:left; border-left: 4px solid ${borderLeftColor};">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <p style="margin:0; font-weight:700;">${b.name} (ID: ${b.user_id})</p>
                        <p style="margin:0; font-size:20px; font-weight:800; color:var(--primary);">₹${b.requested_amount}</p>
                    </div>
                    ${riskBadge}
                </div>
                
                <div style="margin:10px 0; font-size:13px; font-weight:600; color:#10b981;">
                    🛡️ Community Collateral: ₹${b.community_collateral}
                </div>

                <div style="display:flex; gap:10px; margin-top:15px;">
                    <button onclick="toggleDetails(${originalIndex})" style="flex:1; background:rgba(255,255,255,0.1); box-shadow:none;">View Details</button>
                    <button onclick="lend(${originalIndex}, ${b.requested_amount}, ${b.user_id})" style="flex:1;">Fund</button>
                </div>

                <div id="details${originalIndex}" class="details-panel">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <p><b>Tenure:</b> ${N} Months</p>
                        <p><b>Rate:</b> ${b.interest_rate}% p.a.</p>
                        <p><b>Monthly EMI:</b> ₹${emi}</p>
                        <p><b>Collateral:</b> ${b.collateral}</p>
                    </div>
                    <hr style="border:0; border-top:1px solid var(--border); margin:10px 0;">
                    <p style="color:#10b981;"><b>Your Est. Return (70%):</b> ₹${Math.round(totalInterest * 0.7)}</p>
                    <p style="color:#f59e0b;"><b>Community Share (20%):</b> ₹${Math.round(totalInterest * 0.2)}</p>
                </div>
            </div>
        `;
    });

    if (displayCount === 0) {
        html += `<div style="padding:40px; color:var(--text-muted); font-size: 14px;">No loan requests match your current risk appetite. Try switching to "Aggressive".</div>`;
    } else {
        html += htmlCards;
    }

    html += `<div id="result"></div>`;
    document.getElementById("profile").innerHTML = html;
}

function toggleDetails(index) {
    let div = document.getElementById(`details${index}`);
    if (div.style.display === "block") {
        div.style.display = "none";
    } else {
        div.style.display = "block";
    }
}

async function lend(index, amount, borrowerId) {
    if (!smartContract) return updateStatus("Connect MetaMask", true);
    updateStatus("Transacting on Testnet...");

    try {
        let tx = await smartContract.fundLoan(borrowerId, { value: inrToWei(amount) });
        await tx.wait();

        let borrowers = JSON.parse(localStorage.getItem("borrowers"));
        await fetch(`${API}/lend`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ borrower: borrowers[index], amount: amount })
        });
        
        updateStatus("Investment Successful!");
        setTimeout(showLender, 2000);
    } catch (err) {
        updateStatus("Transaction Failed", true);
    }
}

// ================= COMMUNITY STAKING =================
function showCommunity() {
    document.getElementById("profile").innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
            <h2>Governance Staking</h2>
            <button id="walletStatus" onclick="connectWallet()" style="background:#334155; font-size:12px; padding:8px 15px;">🦊 Connect Wallet</button>
        </div>
        
        <div class="glass-card" style="text-align:left; margin-bottom:20px;">
            <p style="font-size:14px; color:var(--text-muted); line-height:1.6;">
                Back a borrower to lower their interest rates. You earn a pro-rata share of the 20% interest pool.
            </p>
            <input id="targetUserId" type="number" placeholder="Enter Borrower ID">
            <input id="stakeAmount" type="number" placeholder="Amount to Stake (Min ₹100)">
            <button onclick="stake()" style="width:100%; background:var(--accent);">Stake</button>
        </div>
        <div id="result"></div>
    `;
}

async function stake() {
    let target = document.getElementById("targetUserId").value;
    let amt = document.getElementById("stakeAmount").value;
    
    if (!target || !amt || amt < 100) return updateStatus("Invalid ID or Amount", true);
    if (!smartContract) return updateStatus("Connect MetaMask", true);

    updateStatus("Signing Governance Transaction...");

    try {
        let tx = await smartContract.stakeCollateral(parseInt(target), { value: inrToWei(amt) });
        await tx.wait();

        await fetch(`${API}/stake`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ target_user_id: parseInt(target), amount: parseInt(amt) })
        });
        
        updateStatus("Community Stake Finalized!");
    } catch (err) {
        updateStatus("Stake Failed", true);
    }
}