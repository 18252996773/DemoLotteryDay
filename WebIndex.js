import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {
  ThirdwebProvider,
  ConnectWallet,
  useContract,
  useContractRead,
  useContractWrite,
} from "@thirdweb-dev/react";
import "./styles/globals.css";
import { GodwokenTestnetV1 } from "@thirdweb-dev/chains";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";

const contractAddress = "0xAF484c308d88f8453beef168b682f405BEd15868";
const sdk = new ThirdwebSDK(GodwokenTestnetV1);
const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
sdk.wallet.connect(signer);
const LuckyType = { NUMBER: 1, BET: 2, CLAIM: 3 };

const getUserAddress = async () => {
  try {
    const userAddress = await sdk.wallet.getAddress();
    return userAddress;
  } catch (e) {
    return "";
  }
};
const checkLuckyType = async () => {
  let luckyType = LuckyType.BET;
  const contract = await sdk.getContract(contractAddress);
  let userAddress = "";
  try {
    userAddress = await sdk.wallet.getAddress();
  } catch (e) {}
  const numberListData = await contract.events.getEvents("LuckyNumber");
  const luckyData = numberListData.find(
    (e) => e.data.fromAddress === userAddress
  );
  if (!luckyData) return LuckyType.NUMBER;
  const txHash = luckyData.transaction.transactionHash;
  const betListData = await contract.events.getEvents("LuckyBet");
  const betData = betListData.find((e) => e.data.txHash === txHash);
  const period = await contract.call("testLotteryCount");
  if (betData) luckyType = LuckyType.NUMBER;
  const claimData = await contract.call("calcWinAmount", [
    parseInt(period) - 1,
    userAddress,
  ]);
  if (parseInt(claimData) > 0) luckyType = LuckyType.CLAIM;
  return luckyType;
};
const getPeriod = async () => {
  const contract = await sdk.getContract(contractAddress);
  const getPeriod = await contract.call("testLotteryCount");
  let period = getPeriod.toNumber();
  return period;
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ThirdwebProvider activeChain={GodwokenTestnetV1}>
      <App
        ConnectWallet={ConnectWallet}
        contractAddress={contractAddress}
        getUserAddress={getUserAddress}
        checkLuckyType={checkLuckyType}
        getPeriod={getPeriod}
        LuckyType={LuckyType}
      />
    </ThirdwebProvider>
  </React.StrictMode>
);

reportWebVitals();
