import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectBTN = document.getElementById("connectBtn");
const fundBTN = document.getElementById("fundBtn");
const balanceBTN = document.getElementById("balanceBtn");
const withdrawBTN = document.getElementById("withdrawBtn");
connectBTN.onclick = connect;
fundBTN.onclick = fund;
balanceBTN.onclick = getBalance;
withdrawBTN.onclick = withdraw;

// SECTION connecting metamask
async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      // TODO connecting with metamask automatically
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
    connectBTN.innerHTML = "Connected";
    // const accounts = await window.ethereum.request({ method: "eth_Accounts" });
    // console.log(accounts);
  } else {
    alert("Please Install Metamask Extension to add Funds...");
  }
}

// SECTION getting available balance from blockchain

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    balanceBTN.innerHTML = `${ethers.utils.formatEther(balance)}`;
    console.log(ethers.utils.formatEther(balance));
  }
}

// SECTION fund function

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`funding with ${ethAmount}`);
  if (typeof window.ethereum !== "undefined") {
    // NOTE to fund we always need =>

    // ANCHOR 1. provider / connection with blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // NOTE ->
    // Web3provider is a wrapper stuff like metamask (window.ethereum). It is very similar to JsonRpcProvider.

    // ANCHOR 2. signer / wallet / someone with some gas
    // TODO since our signer is already connected with metamask.
    const signer = provider.getSigner(); // this will return the whichever wallet is connected to website

    // ANCHOR 3. contract that we are interacting with (ABI & Address)
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // ANCHOR run txns now
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done");
    } catch (error) {
      console.log(error);
    }
  } else {
    alert("Please Install Metamask Extension to add Funds...");
  }
}

// SECTION fund function

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("Withdrawing....");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Wuthdrawn Funds Successfully...");
    } catch (error) {
      console.log(error);
    }
  }
}

// SECTION

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}....`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmantions`
      );
      resolve();
    });
  });
}
