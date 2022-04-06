import Web3 from "web3";
import SocialAwardVaultFactoryContract from "../artifacts/contracts/SocialAwardVaultFactory.sol/SocialAwardVaultFactory.json";
import SocialAwardVaultContract from "../artifacts/contracts/SocialAwardVault.sol/SocialAwardVault.json";

const getWeb3Provider = () => new Web3(Web3.givenProvider || "http://localhost:7545");

const getSocialVaultFactorySC = () => {
  const ABI = SocialAwardVaultFactoryContract.abi;
  const contractAddress = process.env.REACT_APP_SOCIAL_VALUT_FACTORY_ADDRESS;
  const network = process.env.REACT_APP_DEFAULT_NETWORK;
  const web3 = getWeb3Provider();
  const socialVaultFactorySC = new web3.eth.Contract(ABI, contractAddress);
  console.log("contractAddress: ", contractAddress);
  console.log("network: ", network);
  return socialVaultFactorySC;
};

const getSocialVaultSC = contractAddress => {
  const ABI = SocialAwardVaultContract.abi;
  const network = process.env.REACT_APP_DEFAULT_NETWORK;
  const web3 = getWeb3Provider();
  const socialVaultSC = new web3.eth.Contract(ABI, contractAddress);
  console.log("contractAddress: ", contractAddress);
  console.log("network: ", network);
  return socialVaultSC;
};

export { getWeb3Provider, getSocialVaultFactorySC, getSocialVaultSC };