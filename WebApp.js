import {
  useContract,
  useContractRead,
  useContractWrite,
  useContractEvents,
  useAddress,
} from "@thirdweb-dev/react";
import React from "react";
import { ethers } from "ethers";

export default function App(props) {
  const ConnectWallet = props.ConnectWallet;
  const { contract } = useContract(props.contractAddress);
  const { mutateAsync: createLuckyNumber } = useContractWrite(
    contract,
    "createLuckyNumber"
  );
  const { mutateAsync: createLuckyBet } = useContractWrite(
    contract,
    "createLuckyBet"
  );
  const { mutateAsync: claimWinAmount } = useContractWrite(
    contract,
    "claimWinAmount"
  );
  const { getEvents } = useContractEvents(contract);
  const [getPeriod, setPeriod] = React.useState("");
  const [getMessage, setMessage] = React.useState("");
  const [getLuckyNumber, setLuckyNumber] = React.useState("");
  const [getUserAddress, setUserAddress] = React.useState("");
  const [getLuckyType, setLuckyType] = React.useState(props.LuckyType.NUMBER);
  React.useEffect(() => {
    props.getUserAddress().then((data) => {
      setUserAddress(data);
    });
    props.checkLuckyType().then((data) => {
      setLuckyType(data);
    });
    props.getPeriod().then((data) => {
      setPeriod(data);
    });
  });
  async function submitCreateLuckyNumber(e) {
    e.preventDefault();
    setLuckyNumber("");
    try {
      const numberData = await createLuckyNumber({ args: [] });
    } catch (e) {}
    const numberListData = await contract.events.getEvents("LuckyNumber");
    const luckyData = numberListData.find(
      (e) => e.data.fromAddress === getUserAddress
    );
    if (!luckyData) return;
    const txHash = luckyData.transaction.transactionHash;
    var numbers = txHash.replace(/\D/g, "");
    var sumArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var firstIndexArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < numbers.length; i++) {
      const number = parseInt(numbers.charAt(i));
      if (number >= 1 && number <= 9) {
        sumArray[number] += 1;
        const first = firstIndexArray[number];
        if (first == 0) firstIndexArray[number] = i;
      }
    }
    let minSum = 99;
    let minNumber = 99;
    let maxSum = 0;
    let maxNumber = 0;
    for (let i = 1; i < sumArray.length; i++) {
      let sumMin = sumArray[i];
      let numMin = i;
      if (sumMin <= minSum) {
        if (sumMin == minSum) {
          let number1First = firstIndexArray[minNumber];
          let number2First = firstIndexArray[i];
          if (number1First < number2First) {
            sumMin = minSum;
            numMin = minNumber;
          }
        }
        minSum = sumMin;
        minNumber = numMin;
      }
      let sumMax = sumArray[i];
      let numMax = i;
      if (sumMax >= maxSum) {
        if (sumMax == maxSum) {
          let number1First = firstIndexArray[maxNumber];
          let number2First = firstIndexArray[i];
          if (number1First < number2First) {
            sumMax = maxSum;
            numMax = maxNumber;
          }
        }
        maxSum = sumMax;
        maxNumber = numMax;
      }
    }
    setLuckyNumber(maxNumber);
    setLuckyType(props.LuckyType.BET);
  }
  async function submitCreateLuckyBet(e) {
    e.preventDefault();
    const numberListData = await contract.events.getEvents("LuckyNumber");
    const luckyData = numberListData.find(
      (e) => e.data.fromAddress === getUserAddress
    );
    if (!luckyData) return;
    const txHash = luckyData.transaction.transactionHash;
    try {
      const betData = await contract.call("createLuckyBet", [txHash], {
        value: ethers.utils.parseEther("888"),
      });
    } catch (e) {}
    setLuckyType(props.LuckyType.NUMBER);
  }
  async function submitClaimWinAmount(e) {
    e.preventDefault();
    const countData = await contract.call("testLotteryCount");
    const index = parseInt(countData) - 1;
    const claimData = await contract.call("claimWinAmount", [index]);
    setLuckyType(props.LuckyType.NUMBER);
  }
  function printLog(log) {
    if (!log) return;
    const data = getMessage;
    const message = log + "\n\n" + data;
    setMessage(message);
  }
  return (
    <main>
      <div style={{ float: "right" }}>
        <ConnectWallet dropdownPosition={{ side: "bottom", align: "center" }} />
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <label style={{ fontSize: "30px" }}>樂透日第{getPeriod}期</label>
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {getLuckyType === props.LuckyType.NUMBER && (
          <form onSubmit={submitCreateLuckyNumber}>
            <button type="submit" style={{ fontSize: "30px" }}>
              來個隨機幸運號
            </button>
          </form>
        )}
        {getLuckyType === props.LuckyType.BET && (
          <form onSubmit={submitCreateLuckyBet}>
            <button type="submit" style={{ fontSize: "30px" }}>
              投入888CKB幸運號{getLuckyNumber}
            </button>
          </form>
        )}
        {getLuckyType === props.LuckyType.CLAIM && (
          <form onSubmit={submitClaimWinAmount}>
            <button type="submit" style={{ fontSize: "30px" }}>
              上期獎金待領取
            </button>
          </form>
        )}
      </div>
      <div
        style={{
          width: "100%",
          bottom: "20px",
          position: "absolute",
          textAlign: "center",
        }}
      >
        <a href="https://www.yokaiswap.com/" target="_blank" rel="noreferrer">
          <img
            style={{
              width: "50px",
            }}
            src="https://www.yokaiswap.com/favicon.ico"
          />
        </a>
        <a
          href="https://github.com/18252996773/DemoLotteryDay"
          target="_blank"
          rel="noreferrer"
        >
          <img
            style={{
              width: "45px",
            }}
            src="https://icons.iconarchive.com/icons/bokehlicia/captiva/256/web-github-icon.png"
          />
        </a>
      </div>
    </main>
  );
}
