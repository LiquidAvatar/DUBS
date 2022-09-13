const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

describe("SafeWallet", function () {
    it(`It should be deployable`, async function () {
        const [owner] = await ethers.getSigners();
        const DubsContractFactory = await ethers.getContractFactory("Dubs");
        const dubsToken = await DubsContractFactory.deploy();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the SafeWallet
        const SafeWalletContractFactory = await ethers.getContractFactory("SafeWallet");

        // Deploy the SafeWallet
        const safeWallet = await SafeWalletContractFactory.deploy();

        // Get the SafeWallet address
        const safeWalletAddress = safeWallet.address;

        // Send all 3.5b tokens to the SafeWallet address
        await dubsToken.transfer(safeWalletAddress, "3500000000000000000000000000");

        // Check the balance of the SafeWallet
        expect(await dubsToken.balanceOf(safeWalletAddress)).to.equal("3500000000000000000000000000"); 
    });

    it(`Should start off in an unlocked state`, async function () {
        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the SafeWallet
        const SafeWalletContractFactory = await ethers.getContractFactory("SafeWallet");

        // Deploy the SafeWallet
        const safeWallet = await SafeWalletContractFactory.deploy();

        // Get the SafeWallet address
        const safeWalletAddress = safeWallet.address;

        // Check the locked state of the SafeWallet
        expect(await safeWallet.isLocked()).to.equal(false);
    });

    it(`Should start off with no addresses in the allowedWallets list`, async function () {
        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the SafeWallet
        const SafeWalletContractFactory = await ethers.getContractFactory("SafeWallet");

        // Deploy the SafeWallet
        const safeWallet = await SafeWalletContractFactory.deploy();

        // Get the SafeWallet address
        const safeWalletAddress = safeWallet.address;

        // Check the allowedWallets state of the SafeWallet
        expect(await safeWallet.getAllowedWallets()).to.eql([]);
        
    });

    it(`Admin should be able to add allowedWallets while the state is unlocked`, async function () {
        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the SafeWallet
        const SafeWalletContractFactory = await ethers.getContractFactory("SafeWallet");

        // Deploy the SafeWallet
        const safeWallet = await SafeWalletContractFactory.deploy();

        // Get the SafeWallet address
        const safeWalletAddress = safeWallet.address;

        // Check the allowedWallets state of the SafeWallet
        expect(await safeWallet.getAllowedWallets()).to.eql([]);

        // Add an allowedWallet

        const checksumAddress = ethers.utils.getAddress("0x34beb4a3fdaef51def94e8b3dd07da11ed69423e");
        await safeWallet.addAllowedWallet(checksumAddress);

        // Check the allowedWallets state of the SafeWallet
        expect(await safeWallet.getAllowedWallets()).to.eql([checksumAddress]);
        
    });

    it(`Admin should be able to change the state of the contract to locked`, async function () {
        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the SafeWallet
        const SafeWalletContractFactory = await ethers.getContractFactory("SafeWallet");

        // Deploy the SafeWallet
        const safeWallet = await SafeWalletContractFactory.deploy();

        // Get the SafeWallet address
        const safeWalletAddress = safeWallet.address;

        // Check the locked state of the SafeWallet
        expect(await safeWallet.isLocked()).to.equal(false);

        // Change the state of the SafeWallet to locked
        await safeWallet.lockVestingSchedule();

        // Check the locked state of the SafeWallet
        expect(await safeWallet.isLocked()).to.equal(true);
    });


    it(`Admin should NOT be able to add allowedWallets while the state is locked`, async function () {
        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the SafeWallet
        const SafeWalletContractFactory = await ethers.getContractFactory("SafeWallet");

        // Deploy the SafeWallet
        const safeWallet = await SafeWalletContractFactory.deploy();

        // Get the SafeWallet address
        const safeWalletAddress = safeWallet.address;

        // Check the allowedWallets state of the SafeWallet
        expect(await safeWallet.getAllowedWallets()).to.eql([]);

        // Change the state of the SafeWallet to locked
        await safeWallet.lockVestingSchedule();

        // Try to add a new allowed wallet
        const checksumAddress = ethers.utils.getAddress("0x34beb4a3fdaef51def94e8b3dd07da11ed69423e");

        try {
            await safeWallet.addAllowedWallet(checksumAddress)
        } catch(ex) {
            expect(ex.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Schedule is already locked!'");
        }

        // Check the allowedWallets state of the SafeWallet
        expect(await safeWallet.getAllowedWallets()).to.eql([]);
    });

    it(`Admin should be able to add a new vesting schedule event for a wallet on the allowedWallet list while the state is unlocked`, async function () {
        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the SafeWallet
        const SafeWalletContractFactory = await ethers.getContractFactory("SafeWallet");

        // Deploy the SafeWallet
        const safeWallet = await SafeWalletContractFactory.deploy();

        // Get the SafeWallet address
        const safeWalletAddress = safeWallet.address;

        // Check the allowedWallets state of the SafeWallet
        expect(await safeWallet.getAllowedWallets()).to.eql([]);

        // Add an allowedWallet

        const checksumAddress = ethers.utils.getAddress("0x34beb4a3fdaef51def94e8b3dd07da11ed69423e");
        await safeWallet.addAllowedWallet(checksumAddress);

        // Check the allowedWallets state of the SafeWallet
        expect(await safeWallet.getAllowedWallets()).to.eql([checksumAddress]);

        // Add a new vesting schedule event for the allowedWallet
        const vestingScheduleEvent = {
            "month": 0,
            "destinationAddress": checksumAddress.toString(),
            "amount": "1000000000000",
        };

        // Ensure the vesting schedule is empty
        expect(await safeWallet.getVestingScheduleEvents()).to.eql([]);

        // Add the vesting schedule event
        await safeWallet.addVestingScheduleEvent(
            vestingScheduleEvent.month,
            vestingScheduleEvent.destinationAddress,
            BigNumber.from(vestingScheduleEvent.amount)
        );

        const events = await safeWallet.getVestingScheduleEvents();

        const event = {
            "month": events[0].month.toNumber(),
            "destinationAddress": events[0].destinationAddress,
            "amount": events[0].amount.toNumber().toString(),
        }
        
        expect(event).to.eql(vestingScheduleEvent);
        
    });

    it(`Admin should NOT be able to add a new vesting schedule event for a wallet on the allowedWallet list while the state is locked`, async function () {
        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the SafeWallet
        const SafeWalletContractFactory = await ethers.getContractFactory("SafeWallet");

        // Deploy the SafeWallet
        const safeWallet = await SafeWalletContractFactory.deploy();

        // Get the SafeWallet address
        const safeWalletAddress = safeWallet.address;

        // Check the allowedWallets state of the SafeWallet
        expect(await safeWallet.getAllowedWallets()).to.eql([]);

        // Add an allowedWallet

        const checksumAddress = ethers.utils.getAddress("0x34beb4a3fdaef51def94e8b3dd07da11ed69423e");
        await safeWallet.addAllowedWallet(checksumAddress);

        // Check the allowedWallets state of the SafeWallet
        expect(await safeWallet.getAllowedWallets()).to.eql([checksumAddress]);

        // Lock the vesting schedule
        await safeWallet.lockVestingSchedule();

        // Try to add a new vesting schedule event for the allowedWallet (should fail)
        const vestingScheduleEvent = {
            "month": 0,
            "destinationAddress": checksumAddress.toString(),
            "amount": "1000000000000",
        };

        // Ensure the vesting schedule is empty
        expect(await safeWallet.getVestingScheduleEvents()).to.eql([]);

        try {
            await safeWallet.addVestingScheduleEvent(
                vestingScheduleEvent.month,
                vestingScheduleEvent.destinationAddress,
                BigNumber.from(vestingScheduleEvent.amount)
            );
        }
        catch(ex) {
            expect(ex.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Schedule is already locked!'");
        }

        const events = await safeWallet.getVestingScheduleEvents();
        
        expect(events).to.eql([]);
        
    });

 

});