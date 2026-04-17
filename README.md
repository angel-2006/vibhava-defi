# DeFi Protocol: Credit for Creditless

## Idea

Alternative credit scoring systems are used to help people who do not have enough credit history or no credit history at all. In fact, over 160 million people in India are estimated to be credit underserved or lack a formal credit score, according to reports by the World Bank and TransUnion CIBIL.

Our idea is a decentralized P2P lending platform using alternate credit scoring and social staking, removing dependency on traditional credit scores like CIBIL.

---

## Features

* Role-based login (Student, Farmer, Small Business, Regular User)
* Alternate Credit Score Calculation
* P2P Lending Marketplace
* Social Staking (Community-backed trust)
* Blockchain integration using MetaMask and Ethereum for secure, transparent transactions
* Proper risk mitigation strategy for lenders through a community-backed collateral

---

## Credit Score Formula

Features considered: monthly income, UPI transaction count, inflow-outflow ratio, savings ratio, GST filing frequency, past missed payments, and income variance. A weighted average of these features is taken for the final credit score.

Additional features:

* **Students**: No income-related factors considered. Includes spending spike, skillset consideration, and higher weight for community stake
* **Farmers**: Seasonal income considered instead of monthly income
* **Small Businesses**: Revenue growth trend and cash buffer strength included

---

## Tech Stack

* Backend: FastAPI
* Frontend: HTML, CSS, JavaScript
* Blockchain: Solidity + Remix IDE
* Wallet: MetaMask
* Dataset: Mock Account Aggregator

---

## System Flow

1. User logs in (role-based)
2. Data assigned from mock dataset
3. Credit score calculated
4. User dashboard displayed
5. Lenders browse borrowers
6. Community staking builds trust
7. Blockchain handles transactions (future integration)

---

## How to Run (Developer Setup)

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

### Frontend

Open `frontend/index.html` using Live Server

---

## How to Use the Application (User / Judge Guide)

### 1. Open the Application

* Use the deployed link provided in the submission
* The application will load in the browser

---

### 2. Connect Wallet

The platform uses MetaMask for authentication and transaction approval.

* Click "Connect Wallet"
* Select your MetaMask account
* Approve the connection

---

### 3. Wallet Setup (if not installed)

* Install MetaMask browser extension from [https://metamask.io/](https://metamask.io/)
* Create or import a wallet

Note: Use only test accounts. No real funds are required.

---

### 4. Network Configuration

The application runs on the Ethereum test network.

**Network: Sepolia Testnet**

If not available in MetaMask, add manually:

```
Network Name: Sepolia
RPC URL: https://rpc.sepolia.org
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer: https://sepolia.etherscan.io
```

Switch to Sepolia Test Network before interacting with the application.

---

### 5. Test Funds (Optional)

To perform blockchain transactions, test ETH may be required:

* [https://sepoliafaucet.com/](https://sepoliafaucet.com/)
* [https://faucets.chain.link/sepolia](https://faucets.chain.link/sepolia)

---

### 6. Using the Platform

Once connected, users can:

* Lend funds
* Borrow funds
* Repay loans

All transactions require MetaMask confirmation and are recorded on the blockchain.

---

### Notes for Evaluators

* Wallet connection is required for full functionality
* Ensure MetaMask is installed and connected
* Ensure Sepolia Test Network is selected

A demo video is provided for a complete walkthrough of the system.

---

## Contributors

1. Name: Vangala Angel
2. Teammates: Vindhya T V, Elluru Bhavana

Team Name: Vibhava