// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

/// @title Social Award Vault
/// @author Gulaman
/// @notice Social Award Vault (SAV) Smart Contarct (SC). All functions are public for now, will have to turn most of them to internal/private.
/// @dev TODO 1. Implement EIP-1167: Minimal Proxy Contract | 2. When Staking, handle when the staked amount is more than the pending target | 3. Add NFT | 4. Add Links from SC | 5. Send VRF varibales and link fee | 6. add min stake
contract SocialAwardVault is VRFConsumerBase{
    // EVENTS
    event UserStaked(address user, uint256 amount); // event for Etherum Virtual Machine (EVM) logging a user Staking
    event VRFCalled(address SAVAddress); // event for Etherum Virtual Machine (EVM) logging a user Staking
    event UserClaimedVault(address winnerAddress, uint256 socialAwardVaultTargetAmount);

    // SC VARIABLES
    address public socialAwardVaultFactoryAddress; // address of the parent Smart Contract, socialAwardVaultFactory
    address public socialAwardVaultOwner; // address of the user creating the SAV
    string  public socialAwardVaultName; // name of the SAV
    uint256 public socialAwardVaultTargetAmount; // target amount of the Social Award Vault
    uint256 public socialAwardVaultStakedAmount; // current amount of staked tokens
    uint256 public maxStakingAmount; // max Staking amount per Address
    uint256 public minStakingAmount; // max Staking amount per Address
    uint8 public socialAwardVaultProtocolFee; // fee amount applied when staking, later send to the protocol

    // data structures
    address[] public userStakingList; // array with the users staking
    mapping(address => uint256) public userBalancesMap; // mapping showing the balance of each user

    // VRF Variable
    bytes32 internal keyHash;
    uint256 internal linkVRFFeeAmount;

    // Randomness variables
    uint256 public randomResult = 0; // pure random number returned by Chainlink VRF
    uint256 public randomResultMod; // random module

    /**
     * @dev TODO: linkVRFFeeAmount should be editable from SAV Factory Owner
     */
    constructor (uint256 _targetAmount, string memory _socialAwardVaultName, address _awardOwner, uint256 _maxStakingAmount, uint256 _minStakingAmount, uint8 _socialAwardVaultProtocolFee,
    address _VRFCoordinator, address _linkTokenAddress, bytes32 _keyHash)
        VRFConsumerBase(
            _VRFCoordinator,
            _linkTokenAddress
        ) {

        socialAwardVaultOwner = _awardOwner;
        socialAwardVaultName = _socialAwardVaultName;
        socialAwardVaultTargetAmount = _targetAmount;
        maxStakingAmount = _maxStakingAmount;
        minStakingAmount = _minStakingAmount;
        socialAwardVaultProtocolFee = _socialAwardVaultProtocolFee;
        socialAwardVaultFactoryAddress = msg.sender;

        keyHash = _keyHash;
        linkVRFFeeAmount = 1 * 10 ** 18; // 0.1 LINK (Varies by network)
    }

    /**
     * @notice Returns the details of the SAV
     * @return vault creator address, vault name, target amount, staked amount so far, max. staking Amount per User, staking fee, SAV SC address, SAV Factory SC address
     */
    function getSocialAwardVaultData () public view returns (address, string memory, uint256, uint256, uint256, uint256, uint8, address, address) {
        return (socialAwardVaultOwner, socialAwardVaultName, socialAwardVaultTargetAmount, socialAwardVaultStakedAmount, maxStakingAmount, minStakingAmount, socialAwardVaultProtocolFee, address(this), socialAwardVaultFactoryAddress);
    }

    /**
     * @notice Checks if a user is staking in a SAV
     * @return Amount staked by an user address
     */
    function getMyStakingAmount() public view returns (uint256) {
        return userBalancesMap[msg.sender];
    }

    /**
     * @notice Checks if a user is staking in a SAV
     * @return true if user is staking in the SAV. Otherwise, false
     * @dev TODO: that might be turned into not public. It's used _userAddress instead of msg.sender because it might be called from Factory SC.
     */
    function getUserIsStaking(address _userAddress) public view returns (bool) {
        return(userBalancesMap[_userAddress]>0);
    }

    /** 
     * @notice Requests randomness 
     */
    function getRandomNumber() private returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= linkVRFFeeAmount, "Not enough LINK - fill contract with faucet");
        return requestRandomness(keyHash, linkVRFFeeAmount);
    }

    /**
     * @notice Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness;
        randomResultMod = randomResult % (socialAwardVaultTargetAmount);
    }

    /**
     * @notice Stakes the amount sent in SAV, sends the fee to SVF SC and calls getRandomNumber to get the winner once the target amount is reached
     * @dev TODO SAV Factory owner shouldn't stake either | protocol fee should be sent after the random function call, so only is sent once
     */
    function stakeToSocialAwardVault() public payable returns (bytes32){
        require(msg.sender != socialAwardVaultOwner, "Creator can't deposit");
        require(socialAwardVaultTargetAmount > socialAwardVaultStakedAmount, "Target amount fulfilled");
        require(minStakingAmount * (1 + socialAwardVaultProtocolFee / 100) <= msg.value, "Low Deposit");
        require(msg.value <= maxStakingAmount * (1 + socialAwardVaultProtocolFee / 100), "High Deposit");

        bytes32 requestId;

        if (!getUserIsStaking(msg.sender)) {
            userStakingList.push(msg.sender);
        }
        socialAwardVaultStakedAmount += msg.value * (100 - socialAwardVaultProtocolFee) / 100;
        userBalancesMap[msg.sender] += msg.value * (100 - socialAwardVaultProtocolFee) / 100;

        (bool sent, ) = socialAwardVaultFactoryAddress.call{value: msg.value * socialAwardVaultProtocolFee / 100}("");
        require(sent, "Failed to send Ether");
        emit UserStaked(msg.sender,  msg.value);

        if (socialAwardVaultStakedAmount >= socialAwardVaultTargetAmount) {
            requestId = getRandomNumber();
            emit VRFCalled(address(this));
        }
        return requestId;

    }

    /**
     * @notice Returns If User Calling the function is the winner.
     * @dev TODO users are looped in the same order they staked. We can implement a randmon function to instead of starting from the first, choose randomly one. There is no need to ask for VRF on this randomness feature
     */
    function isUserWinner() public view returns(bool) {
        if (randomResult > 0) { // if randomResult > 0, it means VRF has been triggered
            
            uint256 tmpStakedAmount; //
            for (uint i=0; i<userStakingList.length; i++) { // we loop through all customer, first stakers we'll go first
                tmpStakedAmount += userBalancesMap[userStakingList[i]]; // we are adding to tmpStakedAmount the amount staked by the user to 
                if (tmpStakedAmount > randomResultMod) { // tmpStakedAmount is the amount staked by all the previous stakers + the staked amount of usersStaking[i]]. If that's greater than the randomResultMod, that stker is the winner
                    return msg.sender == userStakingList[i]; // if the user calling isUserWinner is the winner, they will recieve true
                }
            }
        }
        return false;
    }

    /**
     * @notice User can claim the Vault, if they are the lucky winner
     */
    function claimSocialAwardVault() public payable{
        require(socialAwardVaultStakedAmount >= socialAwardVaultTargetAmount, "Vault not reached target yet");
        require(isUserWinner(), "User is not the winner");
        (bool sent, ) = msg.sender.call{value: socialAwardVaultTargetAmount}("");
        require(sent, "Failed to send Ether");
        emit UserClaimedVault(msg.sender, socialAwardVaultTargetAmount);
    }
}