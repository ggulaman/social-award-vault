const { expect }  = require('chai');

const chai = require('chai');
const BN = require('bn.js');
//const { ethers } = require('ethers');

// Enable and inject BN dependency
chai.use(require('chai-bn')(BN));

const awardVaultName = 'vaultTest'
const targetAmountInWei = new ethers.BigNumber.from('2000000000000000000')
const awardVaultStakingFee = 50
const awardVaultMaxStakingAmountInWei = new ethers.BigNumber.from('2000000000000000000')
const awardVaultMinStakingAmountInWei = new ethers.BigNumber.from('1000000000000000000')
const VRFCoordinator = '0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9'
const linkTokenAddress = '0xa36085F69e2889c224210F603D836748e7dC0088'
const keyHash = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'

describe('SocialAwardVault Unit Test', function() { 
    before(async function () {
        [socialAwardVaultFactorySCAddress, socialAwardVaultCreator, staker0, staker1] = await ethers.getSigners()
        SocialAwardVault = await ethers.getContractFactory('SocialAwardVault')
        socialAwardVault = await SocialAwardVault.connect(socialAwardVaultFactorySCAddress).deploy(
            targetAmountInWei,
            awardVaultName,
            socialAwardVaultCreator.address,
            awardVaultMaxStakingAmountInWei,
            awardVaultMinStakingAmountInWei,
            awardVaultStakingFee,
            VRFCoordinator,
            linkTokenAddress,
            keyHash
        )
        await socialAwardVault.deployed()
    })

    it('Returns the SAV Details', async function() {
        const [_vaultCreator, _vaultName, _targetAmount, _stakedAmount, _maxStakingAmount, _minStakingAmount,
            _protocolFee, _smartContractAddress, _FactorySCAddress] = await socialAwardVault.connect(socialAwardVaultCreator).getSocialAwardVaultData()
        expect(_vaultCreator).to.be.equal(socialAwardVaultCreator.address)
        expect(_vaultName).to.be.equal(awardVaultName)
        expect((new ethers.BigNumber.from(_targetAmount._hex).toString())).to.equal(targetAmountInWei.toString())
        expect((new ethers.BigNumber.from(_stakedAmount._hex).toString())).to.equal('0')
        expect(_protocolFee).to.be.equal(awardVaultStakingFee)
        expect((new ethers.BigNumber.from(_maxStakingAmount._hex).toString())).to.equal(awardVaultMaxStakingAmountInWei.toString())
        expect((new ethers.BigNumber.from(_minStakingAmount._hex).toString())).to.equal(awardVaultMinStakingAmountInWei.toString())
    })
    
    it('Tests when user stakes, both the amount staked in the SC and the amount sent to Social Award Vault Factory are the expected ones', async function() {
        const socialAwardVaultFactoryProvider = ethers.provider;
        const socialAwardVaultFactoryInitalBalance = await socialAwardVaultFactoryProvider.getBalance(socialAwardVaultFactorySCAddress.address); // Getting Balance of SocialAwardVaultFactory Address
        
        const amountSendBystaker0 = (2 * 10 ** 18).toString()
        const stakedAmount = ((awardVaultStakingFee/100) * amountSendBystaker0).toString()
        
        await socialAwardVault.connect(staker0).stakeToSocialAwardVault({ value: amountSendBystaker0 })
        const [_vaultCreator, _vaultName, _targetAmount, _stakedAmount] = await socialAwardVault.connect(socialAwardVaultCreator).getSocialAwardVaultData()
        expect((new ethers.BigNumber.from(_stakedAmount._hex).toString())).to.equal(stakedAmount)

        const socialAwardVaultFactoryLastProvider = ethers.provider;
        const socialAwardVaultFactoryFinalBalance = await socialAwardVaultFactoryLastProvider.getBalance(socialAwardVaultFactorySCAddress.address);

        // When Staking the User, it is expected the fee is sent to the protocol, then, the SocialVaultFactory Balance should have changed
        expect((new ethers.BigNumber.from(socialAwardVaultFactoryFinalBalance._hex).toString())).to.not.be.equal((new ethers.BigNumber.from((socialAwardVaultFactoryInitalBalance)._hex).toString()))
        
    })

    it('Tests If User Is Staking', async function() {
        const isStaker0Staking = await socialAwardVault.connect(staker0).getUserIsStaking(staker0.address)
        expect(isStaker0Staking).to.equal(true)
        const isStaker1Staking = await socialAwardVault.connect(staker0).getUserIsStaking(staker1.address)
        expect(isStaker1Staking).to.equal(false)
    })

    it('Tests the Amount Staked by an User', async function() {
        const amountSendBystaker0 = (2 * 10 ** 18).toString()
        const stakedAmount = ((awardVaultStakingFee/100) * amountSendBystaker0).toString()
        const _stakedAmountByStaker0 = await socialAwardVault.connect(staker0).getMyStakingAmount()
        const _stakedAmountByStaker1 = await socialAwardVault.connect(staker1).getMyStakingAmount()
        expect((new ethers.BigNumber.from(_stakedAmountByStaker0._hex).toString())).to.equal(stakedAmount)
        expect((new ethers.BigNumber.from(_stakedAmountByStaker1._hex).toString())).to.equal('0')
    })

    it('Tests Social Award Vault Creator Cannot Deposit', async function() {
        const amountToStake = (2 * 10 ** 18).toString()
        await expect(socialAwardVault.connect(socialAwardVaultCreator).stakeToSocialAwardVault({ value: amountToStake })).to.be.revertedWith("Creator can't deposit")
    })

    it('emits an error when staking 0 ETH', async function() {
        await expect(socialAwardVault.connect(staker0).stakeToSocialAwardVault({ value: "0"})).to.be.revertedWith("Low Deposit")
    })
})
