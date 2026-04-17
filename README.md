# DeFi Protocol: Credit for Creditless

## Idea

Alternative credit scoring systems are used to help people who do not have enough credit history or no credit history at all. In fact, over 160 million people in India are estimated to be credit underserved or lack a formal credit score, according to reports by the World Bank and TransUnion CIBIL.

Our idea is a **decentralized P2P lending** platform using **alternate credit scoring** and **social staking**, removing dependency on traditional credit scores like CIBIL.

## Features

* Role-based login (Student, Farmer, Small Business, Regular User)
* Alternate Credit Score Calculation
* P2P Lending Marketplace
* Social Staking (Community-backed trust)
* Blockchain integration using MetaMask and Ethereum for secure, transparent transactions
* Proper risk mitigation strategy for lenders through a community-backed collateral

## Credit Score Formula

Features considered: monthly income, UPI transaction count, Inflow Outflow ratio, Savings ratio, GST filling frequency, past missed payments and income variance. A weighted average of these features is taken for the final credit score.

Additional features are included for:

* Students : No income related factors considered. Apart from that factors like spending spike, skillset consideration, and higher value for community stake provided.
* Farmers : Considering seasonal income, instead of monthly income
* Small Businesses: Additional features like revenue growth trend, and cash buffer strength is considered

## Tech Stack

* Backend: FastAPI
* Frontend: HTML, CSS, JavaScript
* Blockchain: Solidity + Remix IDE
* Wallet: MetaMask
* Dataset: Mock Account Aggregator

## System Flow

1. User logs in (role-based)
2. Data assigned from mock dataset
3. Credit score calculated
4. User dashboard displayed
5. Lenders browse borrowers
6. Community staking builds trust
7. Blockchain handles transactions (future integration)

## How to Run

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

### Frontend

Open frontend/index.html using Live Server

## Contributors

1. Name: Vangala Angel
2. Teammates: Vindhya T V, Elluru Bhavana

Team name: Vibhava