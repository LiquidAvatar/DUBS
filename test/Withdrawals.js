const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const fs = require('fs');

async function loadVestingScheduleFromFile() {
    // Load the CSV 
    const csv = fs.readFileSync('./csv/vesting.csv', 'utf8');

    // Split the CSV into lines
    const lines = csv.split('\n');

    // Split the lines into arrays
    const events = lines.map(line => line.split(','));

    // Convert the arrays into objects
    const vestingEvents = events.map(event => {
        return {
            month: event[0],
            destinationAddress: event[1],
            amount: event[2],
        }
    });

    // Remove the header row
    vestingEvents.shift();

    return vestingEvents;

}

async function loadAllowedAddressesFromFile() {
    // Load the CSV
    try {
        const csv = fs.readFileSync('./csv/allowed_addresses.csv', 'utf8');

        // Split the CSV into lines
        const lines = csv.split('\n');

        return lines;
    }
    catch(ex) {
        console.log(ex);
        return [];
    }
}

async function getExpectedBalanceForAddressAtMonth(address, month) {
    const vestingSchedule = await loadVestingScheduleFromFile();

    // Get the relevant months
    const relevantMonths = vestingSchedule.filter(event => event.month >= month);

    var balances = [];
    // For each address in the relevantMonths, calculate the total at the end
    relevantMonths.forEach((month) => {
        // If it already exists in the array
        if(balances[address]) {
            balances[address] += month.amount;
        }
        else {
            balances[address] = month.amount;
        }
    })

    return balances[address];
}

async function loadExpectedTotalsFromCSV() {
    const csv = fs.readFileSync('./csv/month_totals.csv', 'utf8');

    // Split the CSV into lines
    const lines = csv.split('\n');

    // Split the lines into arrays
    const events = lines.map(line => line.split(','));
    const expectedTotals = events.map(event => {
        return {
            month: event[0],
            address: event[1],
            amount: event[2],
        }
    });

    // Remove the header row
    expectedTotals.shift();

    return expectedTotals;
}

async function getERC20Balances(erc20Contract, addresses) {
    const balances = await Promise.all(addresses.map(address => erc20Contract.balanceOf(address)));
    return balances;
}

async function getERC20Balance(erc20Contract, address) {
    const balance = await erc20Contract.balanceOf(address);
    return balance;
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
            const monthLength = 28 * 24 * 60 * 60;
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
            const monthLength = 28 * 24 * 60 * 60;
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