## Social Award Vault

A link running the dApp: https://awardvault.netlify.app/

## Project Description

SocialAwardVault is a protocol operating on smart blockchain running EVM (Etherum Virtual Machine).
Users can create vaults with a target amount. Then, other users can stake on that vaults.
Once the target amount is reached, a ruffle happens, and the target amount is sent to the lucky winner.

## How to Run this DApp

### Pre-requisites


#### 1. Node.js

Check whether you have Node.js in your machine with the following command, otherwise click [here](https://nodejs.org/en/) to install it.

```bash
node -v
```

If you don't have installed Node.js in your machine, NPM will already be installed along with it. Check whether NPM is installed within your machine with the following command.

```bash
npm -v
```

#### 2. Bockchain Gateway

We have used Infura, but anyother can be used.

#### 3. Metamask

If you have not installed Metamask in your browser, click [here](https://metamask.io/download.html) and follow the instruction to complete the installation process.

### Getting Started
 
#### 1. Install dependencies

```bash
# NPM
npm i

```
#### 2. Add Environment Variables

Copy `.env.example` and `./social-auction-ui/.env.example`, rename them to `.env` and fill in their variables

#### 3. Test the project

```bash
# unit tests
npx hardhat test ./test/unit/*

# integration tests
npx hardhat test ./test/integration/* --network kovan
```

### Development

#### 1. Deploy to Testnet

```bash
# NPM
npm run deploy-to-kovan
```

#### 2. Running the Frontend React App

Navigate to `/social-auction-ui` and install all the packages.
```bash
# NPM
cd ./social-auction-ui
npm
```
Start the app:
```bash
# NPM
npm run start
```

## Tools/Libraries Used to Build/Test this Project

- **Ethereum Solidity** is used to write the smart contract sitting in the backend
- **Javascript** are used to wrtie front end web3 compatible scripts
- **Chainlink** is used as to provide random
- **Remix IDE** and **hardhat** are used as local dev/debug environment for back-end developers
- **MetaMask** is used as Web3.0 wallet provider
- **Infura** are used as gateways to the blockchains
- **GitHub** is used as version control tool for all devs