// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import './SocialAwardVault.sol';


/// @title Social Award Vault Factory
/// @author Gulaman
/// @notice Smart Contract (SC) which generates Social Award Vaults(SAV). This is a beta version of Social Award Vault Factory (SAVF)
/// @dev TODO: 1. Check no duplicated SAV names | 2. Check which functions should not be public | 3. Import the OpenZeppelin Owner SC | 4. OpenZeppelin maths | 5. Check Licences
/// @dev TODO: 6. Check destroy SAV contracts one ruffle completed | 7. Add status on SAV SC: O(Open), C(Close), S(Suspended)
contract SocialAwardVaultFactory {
    // event for Etherum Virtual Machine (EVM) logging the Owner of the SC (Smart Contract)
    event OwnerSet(address indexed oldOwner, address indexed newOwner);
    
    // event for EVM logging the Vault Creation
    event SocialAwardVaultCreation(uint256 vaultId, uint256 targetAmount);

    // event for EVM logging the Global Staking Fee has changed
    event SocialAwardVaultProtoclStakingFeeUpdated(uint8 fee);

    // event when $LINK is transferenpsd
    event TransferSent(address _from, address _destAddr, uint _amount);

    address public owner; // address of the SAVF SC owner
    uint256 public numSocialAwardVaults = 0; // total number of SAVs in the SAVF SC
    uint8 public socialAwardVaultProtolStakingFee;  // protocol fee applied when staking
    uint256 private linkTokenAmountSentToSAV = 1 * 10 ** 18; // amount of Link Tokens sent
    address VRFCoordinator;
    address linkTokenAddress;
    bytes32 keyHash;

    //mapping (uint256 => SocialAwardVault) public socialAwardVaults;
    SocialAwardVault[] public  socialAwardVaults;

    /**
     * @dev Set contract deployer as owner. We should inheritate the owner feature from OpenZeppelin Owner SC
     */
     constructor(address _linkTokenAddress, address _VRFCoordinator, bytes32 _keyHash) {
        owner = msg.sender; // 'msg.sender' is sender of current call, contract deployer for a constructor
        emit OwnerSet(address(0), owner);

        VRFCoordinator = _VRFCoordinator;
        linkTokenAddress = _linkTokenAddress;
        keyHash = _keyHash;
    }

    /**
     * @notice Creates a new SAV
     * @dev TODO: 1. NFT deposit is pending. 2. Dynamic Fee might be integrated in the future. 3. Weight Randomnes pending
     * @param _targetAmount target value to be reached, _vaultName The SAV Name, _maxStakingAmount MAX staking amount on an staking, _minStakingAmount min staking amount on an staking
     * @return the SAV id
     */
     function createSocialAwardVault(uint256 _targetAmount, string memory _vaultName, uint256 _maxStakingAmount, uint256 _minStakingAmount) public returns(uint256) {
        SocialAwardVault socialAwardVault = new SocialAwardVault(_targetAmount, _vaultName, msg.sender, _maxStakingAmount, _minStakingAmount, socialAwardVaultProtolStakingFee, VRFCoordinator, linkTokenAddress, keyHash);
        socialAwardVaults.push(socialAwardVault);
        
        emit SocialAwardVaultCreation(numSocialAwardVaults, _targetAmount);
        numSocialAwardVaults += 1;
        transferLinkERC20(address(socialAwardVault), linkTokenAmountSentToSAV);
        return numSocialAwardVaults -1;
    }

    /**
     * @notice Function to receive Ether. msg.data must be empty
     * @dev TODO: Check if works when sending tx with and without message
     */
    receive() external payable {}

    /**
     * @notice Returns the TVL in the SC
     * @return The balance of the SVF SC
     */
    function getSmartContractBalance() public view returns (uint256) {
        return (address(this).balance);
    }

    /**
     * @notice Returns number of Existing SAVs
     * @dev TODO: implemented funtions to return active/finished SAVs
     * @return Number of SAVs in the SC
     */
    function getNumberOfSocialAwardVaults() public view returns (uint256) {
        return numSocialAwardVaults;
    }

    /**
     * @notice Returns the number of SAVs the User is staking in
     * @return the number of SAVs the user is staking in
     */
    function getNumberOfAwardVaultsOfUser() public view returns (uint256) {
        uint256 numSocialAwardVaultsOfUser;
        for (uint256 i; i < numSocialAwardVaults; i++) {
            SocialAwardVault socialAwardVault = socialAwardVaults[i];
            if (socialAwardVault.getUserIsStaking(msg.sender)) {
                numSocialAwardVaultsOfUser ++;
            }
        }
        return numSocialAwardVaultsOfUser;
    }

    /**
     * @notice Returns the number of Active
     * @return the number of Active SAVs
     */
    function getNumberOfActiveAwardVaults() public view returns (uint256) {
        uint256 numActiveSocialAwardVaultsOfUser;
        for (uint256 i; i < numSocialAwardVaults; i++) {
            SocialAwardVault socialAwardVault = socialAwardVaults[i];
            if (socialAwardVault.socialAwardVaultTargetAmount() > socialAwardVault.socialAwardVaultStakedAmount()) {
                numActiveSocialAwardVaultsOfUser ++;
            }
        }
        return numActiveSocialAwardVaultsOfUser;
    }

    /**
     * @notice Returns the number of SAVs the User is staking in
     * @return the number of SAVs the user is staking in
     */
    function getSocialAwardVaultsStakedByUser() public view returns (uint256[] memory) {
        uint256 numSocialAwardVaultsOfUser = getNumberOfAwardVaultsOfUser();
        uint256 counterSocialAwardVaultsOfUser;
        uint256[] memory socialAwardVaultsOfUser = new uint256[](numSocialAwardVaultsOfUser);
        
        for (uint256 i; i < numSocialAwardVaults && counterSocialAwardVaultsOfUser < numSocialAwardVaultsOfUser ; i++) {
            SocialAwardVault socialAwardVault = socialAwardVaults[i];
            if (socialAwardVault.getUserIsStaking(msg.sender)) {
                socialAwardVaultsOfUser[counterSocialAwardVaultsOfUser] = i;
                counterSocialAwardVaultsOfUser += 1;
            }
        }
        return socialAwardVaultsOfUser;
    }

   /**
     * @notice Returns a list with the Active SAVs
     * @return a list with the Active SAVs
     */
    function getActiveSocialAwardVaults() public view returns (uint256[] memory) {
        uint256 numActiveSocialActiveAwardVaults = getNumberOfActiveAwardVaults();
        uint256 counterActiveSocialAwardVaults;
        uint256[] memory activeSocialAwardVaults = new uint256[](numActiveSocialActiveAwardVaults);
        
        for (uint256 i; i < numSocialAwardVaults && counterActiveSocialAwardVaults < numActiveSocialActiveAwardVaults; i++) {
            SocialAwardVault socialAwardVault = socialAwardVaults[i];
            if (socialAwardVault.socialAwardVaultTargetAmount() > socialAwardVault.socialAwardVaultStakedAmount()) {
                activeSocialAwardVaults[counterActiveSocialAwardVaults] = i;
                counterActiveSocialAwardVaults += 1;
            }
        }
        return activeSocialAwardVaults;
    }

    /**
     * @notice Returns the details of a SAV
     * @param _socialAwardVaultId the Id of a SAV
     * @return vault creator address, vault name, target amount, staked amount so far, max. staking Amount per User, staking fee, SAV SC address, SAV Factory SC address
     */
    function getSocialAwardVaultDetailsById(uint256 _socialAwardVaultId) public view returns (address, string memory, uint256, uint256, uint256, uint256, uint8, address, address) {
        SocialAwardVault socialAwardVault = socialAwardVaults[_socialAwardVaultId];
        return socialAwardVault.getSocialAwardVaultData();
    }

    /**
     * @notice Updates the global Staking Fee which will update all new SAVs
     * @dev TODO: Currently it just handle integers from 0 to 100. We should add an impl. to handle integers from 0 to 10000, so it would be a percentage with 2 decimals.
     * @param _newSocialAwardVaultProtolStakingFee which is the new fee
     */
    function setAwardVaultProtolStakingFee(uint8 _newSocialAwardVaultProtolStakingFee) public {
        require(msg.sender == owner, "Fee only updateable by SVF owner");
        require(_newSocialAwardVaultProtolStakingFee < 100, "Fee Can't be > 99");
        socialAwardVaultProtolStakingFee = _newSocialAwardVaultProtolStakingFee;
        emit SocialAwardVaultProtoclStakingFeeUpdated(_newSocialAwardVaultProtolStakingFee);
    }

    /**
     * @notice Transfers Link tokens from the SAVF to the new SAV
     */
    function transferLinkERC20(address _to, uint256 _amount) private {
        IERC20 linkToken = IERC20(linkTokenAddress);
        uint256 erc20balance = linkToken.balanceOf(address(this));
        require(_amount <= erc20balance, "Low Link balance");
        linkToken.transfer(_to, _amount);
        emit TransferSent(msg.sender, _to, _amount);
    }
}