const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

function createRandomVestingScheduleForMonth(month) {

}

function generateRandomAllowedWallets() {
    const allowedAddresses = [
        ethers.utils.getAddress('0x0000000000000000000000000000000000000001'),
        ethers.utils.getAddress('0x0000000000000000000000000000000000000002'),
        ethers.utils.getAddress('0x0000000000000000000000000000000000000003'),
        ethers.utils.getAddress('0x0000000000000000000000000000000000000004'),
    ];

    return allowedAddresses;
}

async function getBalances(token, addresses) {
    const balances = [];
    for (let i = 0; i < addresses.length; i++) {
        balances.push(BigNumber.from(token.balanceOf(addresses[i])));
    }

    return balances;
}


describe("VestingWallet Withdrawals", function () {

    it(`It should set up a vesting schedule for the first month, freeze it, then be instantly withdrawable`, async function () {

        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the VestingWallet
        const VestingWalletContractFactory = await ethers.getContractFactory("VestingWallet");

        const TokenWalletFactory = await ethers.getContractFactory("Dubs");

        // Deploy the VestingWallet
        const vestingWallet = await VestingWalletContractFactory.deploy();

        // Get the VestingWallet address
        const vestingWalletAddress = vestingWallet.address;

        // Set up the ERC20, deposit it to the VestingWallet, and freeze it
        const tokenWallet = await TokenWalletFactory.deploy();

        // Set the ERC20 on the VestingWallet
        await vestingWallet.setToken(tokenWallet.address);

        await tokenWallet.transfer(vestingWalletAddress, 3500000000);

        const balance = await tokenWallet.balanceOf(vestingWalletAddress);

        expect(balance).to.equal(3500000000);

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql([]);

        // Add an allowedWallet
        const allowedAddresses = generateRandomAllowedWallets();

        for(i = 0; i < allowedAddresses.length; i++) {
            await vestingWallet.addAllowedWallet(allowedAddresses[i]);
        }

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql(allowedAddresses);

        // Ensure the vesting schedule is empty
        expect(await vestingWallet.getVestingScheduleEvents()).to.eql([]);

        for(let addressIndex = 0; addressIndex < allowedAddresses.length; addressIndex++) {

            const vestingScheduleEvent = {
                "month": 0,
                "destinationAddress": allowedAddresses[addressIndex].toString(),
                "amount": "100000",
            };

            // Add the vesting schedule event
            await vestingWallet.addVestingScheduleEvent
            (
                vestingScheduleEvent.month,
                vestingScheduleEvent.destinationAddress,
                BigNumber.from(vestingScheduleEvent.amount)
            );

        }

        

        // Freeze the vesting schedule
        await vestingWallet.lockVestingSchedule();

        await vestingWallet.withdraw(0);

        expect(
            await tokenWallet.balanceOf(generateRandomAllowedWallets()[0])
        ).to.equal(100000);

        expect(
            await tokenWallet.balanceOf(generateRandomAllowedWallets()[1])
        ).to.equal(100000);

        expect(
            await tokenWallet.balanceOf(generateRandomAllowedWallets()[2])
        ).to.equal(100000);

        expect(
            await tokenWallet.balanceOf(generateRandomAllowedWallets()[3])
        ).to.equal(100000);

        

    });

    it(`It should set up a vesting schedule for the first month + second month, then freeze it. Only the 1st month should be executable`, async function () {

        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the VestingWallet
        const VestingWalletContractFactory = await ethers.getContractFactory("VestingWallet");

        const TokenWalletFactory = await ethers.getContractFactory("Dubs");

        // Deploy the VestingWallet
        const vestingWallet = await VestingWalletContractFactory.deploy();

        // Get the VestingWallet address
        const vestingWalletAddress = vestingWallet.address;

        // Set up the ERC20, deposit it to the VestingWallet, and freeze it
        const tokenWallet = await TokenWalletFactory.deploy();

        // Set the ERC20 on the VestingWallet
        await vestingWallet.setToken(tokenWallet.address);

        await tokenWallet.transfer(vestingWalletAddress, 3500000000);

        const balance = await tokenWallet.balanceOf(vestingWalletAddress);

        expect(balance).to.equal(3500000000);

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql([]);

        // Add an allowedWallet
        const allowedAddresses = generateRandomAllowedWallets();

        for(i = 0; i < allowedAddresses.length; i++) {
            await vestingWallet.addAllowedWallet(allowedAddresses[i]);
        }

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql(allowedAddresses);

        // Ensure the vesting schedule is empty
        expect(await vestingWallet.getVestingScheduleEvents()).to.eql([]);

        for(let addressIndex = 0; addressIndex < allowedAddresses.length; addressIndex++) {

            const vestingScheduleEvent = {
                "month": 0,
                "destinationAddress": allowedAddresses[addressIndex].toString(),
                "amount": "100000",
            };

            const vestingScheduleEvent2 = {
                "month": 1,
                "destinationAddress": allowedAddresses[addressIndex].toString(),
                "amount": "100000",
            };


            // Add the vesting schedule event
            await vestingWallet.addVestingScheduleEvent
            (
                vestingScheduleEvent.month,
                vestingScheduleEvent.destinationAddress,
                BigNumber.from(vestingScheduleEvent.amount)
            );

            
            // Add the vesting schedule event
            await vestingWallet.addVestingScheduleEvent
            (
                vestingScheduleEvent2.month,
                vestingScheduleEvent2.destinationAddress,
                BigNumber.from(vestingScheduleEvent2.amount)
            );
        }

        

        // Freeze the vesting schedule
        await vestingWallet.lockVestingSchedule();

        await vestingWallet.withdraw(0);

        expect(
            await tokenWallet.balanceOf(generateRandomAllowedWallets()[0])
        ).to.equal(100000);

        expect(
            await tokenWallet.balanceOf(generateRandomAllowedWallets()[1])
        ).to.equal(100000);

        expect(
            await tokenWallet.balanceOf(generateRandomAllowedWallets()[2])
        ).to.equal(100000);

        expect(
            await tokenWallet.balanceOf(generateRandomAllowedWallets()[3])
        ).to.equal(100000);

        // Attempt to run the 2nd month. Should fail.

        try {
            await vestingWallet.withdraw(1);
            expect(false).to.equal(true);
        } catch(ex) {
            expect(ex.message).to.equal(`VM Exception while processing transaction: reverted with reason string 'The specified months vesting schedule is not runnable yet'`)
        }

        expect(
            await tokenWallet.balanceOf(generateRandomAllowedWallets()[0])
        ).to.equal(100000);

        expect(
            await tokenWallet.balanceOf(generateRandomAllowedWallets()[1])
        ).to.equal(100000);

        expect(
            await tokenWallet.balanceOf(generateRandomAllowedWallets()[2])
        ).to.equal(100000);

        expect(
            await tokenWallet.balanceOf(generateRandomAllowedWallets()[3])
        ).to.equal(100000);

    });

    it(`It should set up a vesting schedule for the second month, then freeze it. It should not be executable until a block has been mined at laest 28 days after the start`, async function () {

        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the VestingWallet
        const VestingWalletContractFactory = await ethers.getContractFactory("VestingWallet");

        const TokenWalletFactory = await ethers.getContractFactory("Dubs");

        // Deploy the VestingWallet
        const vestingWallet = await VestingWalletContractFactory.deploy();

        // Get the VestingWallet address
        const vestingWalletAddress = vestingWallet.address;

        // Set up the ERC20, deposit it to the VestingWallet, and freeze it
        const tokenWallet = await TokenWalletFactory.deploy();

        // Set the ERC20 on the VestingWallet
        await vestingWallet.setToken(tokenWallet.address);

        await tokenWallet.transfer(vestingWalletAddress, 3500000000);

        const balance = await tokenWallet.balanceOf(vestingWalletAddress);

        expect(balance).to.equal(3500000000);

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql([]);

        // Add an allowedWallet
        const allowedAddresses = generateRandomAllowedWallets();

        for(i = 0; i < allowedAddresses.length; i++) {
            await vestingWallet.addAllowedWallet(allowedAddresses[i]);
        }

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql(allowedAddresses);

        // Ensure the vesting schedule is empty
        expect(await vestingWallet.getVestingScheduleEvents()).to.eql([]);

        for(let addressIndex = 0; addressIndex < allowedAddresses.length; addressIndex++) {

            const vestingScheduleEvent = {
                "month": 1,
                "destinationAddress": allowedAddresses[addressIndex].toString(),
                "amount": "100000",
            };


            // Add the vesting schedule event
            await vestingWallet.addVestingScheduleEvent
            (
                vestingScheduleEvent.month,
                vestingScheduleEvent.destinationAddress,
                BigNumber.from(vestingScheduleEvent.amount)
            );
        }

        

        // Freeze the vesting schedule
        await vestingWallet.lockVestingSchedule();

        // Attempt to run the 2nd month. Should fail.

        try {
            await vestingWallet.withdraw(1);
            expect(false).to.equal(true);
        } catch(ex) {
            expect(ex.message).to.equal(`VM Exception while processing transaction: reverted with reason string 'The specified months vesting schedule is not runnable yet'`)
        }        

        // Now increment the time by 28 days. It should be runnable now.

        try {
            await ethers.provider.send('evm_increaseTime', [monthLength]);
            await vestingWallet.withdraw(1);
            
        } catch(ex) {
            expect(ex.message).to.equal(`VM Exception while processing transaction: reverted with reason string 'The specified months vesting schedule is not runnable yet'`)
        }

        
        expect(
            await tokenWallet.balanceOf(generateRandomAllowedWallets()[0])
        ).to.equal(100000);

        expect(
            await tokenWallet.balanceOf(generateRandomAllowedWallets()[1])
        ).to.equal(100000);

        expect(
            await tokenWallet.balanceOf(generateRandomAllowedWallets()[2])
        ).to.equal(100000);

        expect(
            await tokenWallet.balanceOf(generateRandomAllowedWallets()[3])
        ).to.equal(100000);
        
    });

    

});