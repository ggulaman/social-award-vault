const { expect }  = require('chai');

const LinkTokenABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"transferAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"data","type":"bytes"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]

const chai = require('chai');
const BN = require('bn.js');

// Enable and inject BN dependency
chai.use(require('chai-bn')(BN));

const socialAwardVault0Name = 'vaultTest0'
const socialAwardVault0TargetAmount = new ethers.BigNumber.from('3000000000000000')
const socialAwardVault0MaxStakingAmount = new ethers.BigNumber.from('2000000000000000')
const socialAwardVault0MinStakingAmount = new ethers.BigNumber.from('1000000000000000')

const socialAwardVault1Name = 'vaultTest1'
const socialAwardVault1TargetAmount = new ethers.BigNumber.from('4000000000000000')
const socialAwardVault1MaxStakingAmount = new ethers.BigNumber.from('2000000000000000')
const socialAwardVault1MinStakingAmount = new ethers.BigNumber.from('1000000000000000')

const linkTokenAddress = '0xa36085F69e2889c224210F603D836748e7dC0088'
const VRFCoordinator = '0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9'
const keyHash = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'

let socialAwardVaultStakingFee = 0
let staker0, staker1

describe('SocialAwardVaultFactory Unit Test', function() { 
    before(async function () {

        [socialAwardVaultFactoryCreator, socialAwardVaultCreator, staker0, staker1] = await ethers.getSigners()
        SocialAwardVaultFactory = await ethers.getContractFactory('SocialAwardVaultFactory')
        SocialAwardVault0 = await ethers.getContractFactory('SocialAwardVault')
        SocialAwardVault1 = await ethers.getContractFactory('SocialAwardVault')
        SocialAwardVault2 = await ethers.getContractFactory('SocialAwardVault')

        socialAwardVaultFactory = await SocialAwardVaultFactory.connect(socialAwardVaultFactoryCreator).deploy(linkTokenAddress, VRFCoordinator, keyHash)
        await socialAwardVaultFactory.deployed()

        const linkTokenContract = new ethers.Contract(linkTokenAddress, LinkTokenABI, socialAwardVaultFactoryCreator)
        console.log('social vault fac addresss is', socialAwardVaultFactory.address)
        var transferTransaction = await linkTokenContract.transfer(socialAwardVaultFactory.address, (3 * 10 ** 18).toString())
        await transferTransaction.wait()
        console.log('hash: '+ transferTransaction.hash)


        socialAwardVaultStakingFee = 50
        await socialAwardVaultFactory.connect(socialAwardVaultFactoryCreator).setAwardVaultProtolStakingFee(socialAwardVaultStakingFee)
        //await socialAwardVaultFactory.connect(socialAwardVaultFactoryCreator).createSocialAwardVault(socialAwardVault0TargetAmount, socialAwardVault0Name, socialAwardVault0MaxStakingAmount, socialAwardVault0MinStakingAmount)
    })   
    


    it('Tests only SAVF owner can update the SAV Staking Fee', async function() {
        const newVaultStakingFee = 50
        returnedStakingFee = socialAwardVaultFactory.connect(socialAwardVaultCreator).setAwardVaultProtolStakingFee(newVaultStakingFee)
        await expect(socialAwardVaultFactory.connect(socialAwardVaultCreator).setAwardVaultProtolStakingFee(newVaultStakingFee)).to.be.revertedWith("Fee only updateable by SVF owner")
    })

    it('Tests the SV Staking Fee is not greater than 99', async function() {
        const newVaultStakingFee = 100
        await expect(socialAwardVaultFactory.connect(socialAwardVaultFactoryCreator).setAwardVaultProtolStakingFee(newVaultStakingFee)).to.be.revertedWith("Fee Can't be > 99")
    })
    /*
    it('Stakes and Pays the fee to the SV Factory SC', async function() {
        const socialVaultFactoryInitalBalance = await socialAwardVaultFactory.getSmartContractBalance(); // Getting Balance of SocialVaultFactory Address
        const retrievedVaultStakingFee = await socialAwardVaultFactory.socialAwardVaultProtolStakingFee();
        const amountSendByUser = (2 * 10 ** 15).toString()
        const expectedAmountStakedByUser = amountSendByUser * (100 - retrievedVaultStakingFee) / 100

        retriviedSocialAwardVault0 = await socialAwardVaultFactory.socialAwardVaults(0)
        socialAwardVault0 = await SocialAwardVault0.attach(retriviedSocialAwardVault0)
        const [,,,stakedAmount,,,sVStakingFee] = await socialAwardVaultFactory.connect(staker0).getSocialAwardVaultDetailsById(0)
        expect(stakedAmount).to.be.equal(0)
        expect(sVStakingFee).to.be.equal(retrievedVaultStakingFee)

        await socialAwardVault0.connect(staker0).stakeToSocialAwardVault({ value: amountSendByUser})
        const [,,,stakedAmountAfterStaking] = await socialAwardVaultFactory.connect(staker0).getSocialAwardVaultDetailsById(0)

        expect((new ethers.BigNumber.from(stakedAmountAfterStaking._hex).toString())).to.equal(expectedAmountStakedByUser.toString())

        // When Staking the User, it is expected the fee is sent to the protocol, then, the SocialVaultFactory Balance should have changed
        const socialVaultFactoryFinalBalance = await socialAwardVaultFactory.getSmartContractBalance(); // Getting Balance of SocialVaultFactory Address
        expect((new ethers.BigNumber.from(socialVaultFactoryFinalBalance._hex))).to.be.gt((new ethers.BigNumber.from((socialVaultFactoryInitalBalance)._hex)))
    })
    
    it('Returns the SV where user has staked', async function() {
        const amountSendByUser = (2 * 10 ** 15).toString()
        
        await socialAwardVaultFactory.connect(socialAwardVaultCreator).createSocialAwardVault(socialAwardVault1TargetAmount, socialAwardVault1Name, socialAwardVault1MaxStakingAmount, socialAwardVault1MinStakingAmount)
        socialVault2Address = await socialAwardVaultFactory.socialAwardVaults(2)
        socialAwardVault2 = await SocialAwardVault2.attach(socialVault2Address)

        await socialAwardVault2.connect(staker0).stakeToSocialAwardVault({ value: amountSendByUser})
        numOfUserVaults = await socialAwardVaultFactory.connect(staker0).getNumberOfAwardVaultsOfUser()
        expect(numOfUserVaults).to.be.equal(2)

        allVaults = await socialAwardVaultFactory.connect(staker0).getNumberOfSocialAwardVaults()
        expect(allVaults).to.be.equal(3)

        userVaults = await socialAwardVaultFactory.connect(staker0).getSocialAwardVaultsStakedByUser()
        expect(userVaults.length).to.be.equal(2)
        userVaultsMod = [new ethers.BigNumber.from(userVaults[0]._hex).toString(), new ethers.BigNumber.from(userVaults[1]._hex).toString()]
        expect(userVaultsMod[0]).to.equal('2')
        expect(userVaultsMod[1]).to.equal('0')
    })
    */
    
})
