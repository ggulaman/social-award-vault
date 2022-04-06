const hre = require("hardhat");
const ethers = hre.ethers;


const linkVRFAddresses = {
    'kovan': {
        tokenAddress: '0xa36085F69e2889c224210F603D836748e7dC0088',
        VRFCoordinator: '0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9',
        keyhHash: '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'
    },
    'mumbai': {
        tokenAddress: '0x326C977E6efc84E512bB9C30f76E30c160eD06FB',
        VRFCoordinator: '0x8C7382F9D8f56b33781fE506E897a4F1e2d17255',
        keyhHash: '0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4'
    },
    'rinkeby': {
        tokenAddress: '0x01BE23585060835E02B77ef475b0Cc51aA1e0709',
        VRFCoordinator: '0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B',
        keyhHash: '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311'
    }/*,
    'Avalanche Fuji Tesnet': {
        tokenAddress = '0xa36085F69e2889c224210F603D836748e7dC0088',
        VRFCoordinator = '0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9',
        keyhHash = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'
    }*/

}

const network = process.env.HARDHAT_NETWORK;
const main = async() => {
    await hre.run('compile');
    const [deployer] = await hre.ethers.getSigners();
    console.log("deployer balance:", (await deployer.getBalance()).toString());
    if (network && linkVRFAddresses[network]){
        console.log(`Deploying SocialAwardVaultFactory SC to ${network} network`);
        const SocialAwardVaultFactory = await hre.ethers.getContractFactory("SocialAwardVaultFactory");
        const savfsc = await SocialAwardVaultFactory.deploy(
            linkVRFAddresses[network].tokenAddress,
            linkVRFAddresses[network].VRFCoordinator,
            linkVRFAddresses[network].keyhHash
        );
        console.log(`SocialAwardVaultFactory deployed to the following address ${savfsc.address}`);
    } else {
        console.error(`${network} is not a valid one`);
    }
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })