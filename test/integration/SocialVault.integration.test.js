const LinkTokenABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"transferAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"data","type":"bytes"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]

const { expect }  = require('chai');
const chai = require('chai');
const BN = require('bn.js');
const { ethers } = require('hardhat');

// Enable and inject BN dependency
chai.use(require('chai-bn')(BN));

const awardVaultName = 'vaultTest'
const targetAmountInWei = new ethers.BigNumber.from((2 * 10 ** 15).toString())
const awardVaultStakingFee = 0
const awardVaultMaxStakingAmountInWei = new ethers.BigNumber.from((2 * 10 ** 15).toString())
const awardVaultMinStakingAmountInWei = new ethers.BigNumber.from('0')
const linkTokenAddress = '0xa36085F69e2889c224210F603D836748e7dC0088'
const VRFCoordinator = '0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9'
const keyHash = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'

describe('SocialVault Integration Test', function() { 
    before(async function () {
        [socialAwardVaultFactory, staker0] = await ethers.getSigners()
        SocialAwardVault = await ethers.getContractFactory('SocialAwardVault')
        socialAwardVault = await SocialAwardVault.connect(socialAwardVaultFactory).deploy(
            targetAmountInWei,
            awardVaultName,
            socialAwardVaultFactory.address,
            awardVaultMaxStakingAmountInWei,
            awardVaultMinStakingAmountInWei,
            awardVaultStakingFee,
            VRFCoordinator,
            linkTokenAddress,
            keyHash
        )
        await socialAwardVault.deployed()

        const linkTokenContract = new ethers.Contract(linkTokenAddress, LinkTokenABI, socialAwardVaultFactory)
        var transferTransaction = await linkTokenContract.transfer(socialAwardVault.address, (1 * 10 ** 18).toString())
        await transferTransaction.wait()
        console.log('hash: '+ transferTransaction.hash)
    })

    it('Tests when one user is the only staker, that one must be the winner', async function() {
        expect(await socialAwardVault.connect(staker0).isUserWinner()).to.be.equal(false)

        const amountSendByUser = new ethers.BigNumber.from((2 * 10 ** 15).toString())
        let stakeTx = await socialAwardVault.connect(staker0).stakeToSocialAwardVault({ value: amountSendByUser})
        let tx_receipt = await stakeTx.wait()
        
        await new Promise(resolve => setTimeout(resolve, 60000))
        expect(await socialAwardVault.connect(staker0).isUserWinner()).to.be.equal(true)
    })
})