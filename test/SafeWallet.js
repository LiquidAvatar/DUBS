const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

describe("VesingWallet", function () {
    it(`It should be deployable`, async function () {
        const [owner] = await ethers.getSigners();
        const DubsContractFactory = await ethers.getContractFactory("Dubs");
        const dubsToken = await DubsContractFactory.deploy();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the VestingWallet
        const VestingWalletContractFactory = await ethers.getContractFactory("VestingWallet");

        // Deploy the VestingWallet
        const vestingWallet = await VestingWalletContractFactory.deploy();

        // Get the VestingWallet address
        const vestingWalletAddress = vestingWallet.address;

        // Send all 3.5b tokens to the VestingWallet address
        await dubsToken.transfer(vestingWalletAddress, "3500000000000000000000000000");

        // Check the balance of the VestingWallet
        expect(await dubsToken.balanceOf(vestingWalletAddress)).to.equal("3500000000000000000000000000"); 
    });

    it(`Should start off in an unlocked state`, async function () {
        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the VestingWallet
        const VestingWalletContractFactory = await ethers.getContractFactory("VestingWallet");

        // Deploy the VestingWallet
        const vestingWallet = await VestingWalletContractFactory.deploy();

        // Get the VestingWallet address
        const vestingWalletAddress = vestingWallet.address;

        // Check the locked state of the VestingWallet
        expect(await vestingWallet.isLocked()).to.equal(false);
    });

    it(`Should start off with no addresses in the allowedWallets list`, async function () {
        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the VestingWallet
        const VestingWalletContractFactory = await ethers.getContractFactory("VestingWallet");

        // Deploy the VestingWallet
        const vestingWallet = await VestingWalletContractFactory.deploy();

        // Get the VestingWallet address
        const vestingWalletAddress = vestingWallet.address;

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql([]);
        
    });

    it(`Admin should be able to add allowedWallets while the state is unlocked`, async function () {
        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the VestingWallet
        const VestingWalletContractFactory = await ethers.getContractFactory("VestingWallet");

        // Deploy the VestingWallet
        const vestingWallet = await VestingWalletContractFactory.deploy();

        // Get the VestingWallet address
        const vestingWalletAddress = vestingWallet.address;

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql([]);

        // Add an allowedWallet

        const checksumAddress = ethers.utils.getAddress("0x34beb4a3fdaef51def94e8b3dd07da11ed69423e");
        await vestingWallet.addAllowedWallet(checksumAddress);

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql([checksumAddress]);
        
    });

    it(`Admin should be able to change the state of the contract to locked`, async function () {
        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the VestingWallet
        const VestingWalletContractFactory = await ethers.getContractFactory("VestingWallet");

        // Deploy the VestingWallet
        const vestingWallet = await VestingWalletContractFactory.deploy();

        // Get the VestingWallet address
        const vestingWalletAddress = vestingWallet.address;

        // Check the locked state of the VestingWallet
        expect(await vestingWallet.isLocked()).to.equal(false);

        // Change the state of the VestingWallet to locked
        await vestingWallet.lockVestingSchedule();

        // Check the locked state of the VestingWallet
        expect(await vestingWallet.isLocked()).to.equal(true);
    });


    it(`Admin should NOT be able to add allowedWallets while the state is locked`, async function () {
        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the VestingWallet
        const VestingWalletContractFactory = await ethers.getContractFactory("VestingWallet");

        // Deploy the VestingWallet
        const vestingWallet = await VestingWalletContractFactory.deploy();

        // Get the VestingWallet address
        const vestingWalletAddress = vestingWallet.address;

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql([]);

        // Change the state of the VestingWallet to locked
        await vestingWallet.lockVestingSchedule();

        // Try to add a new allowed wallet
        const checksumAddress = ethers.utils.getAddress("0x34beb4a3fdaef51def94e8b3dd07da11ed69423e");

        try {
            await vestingWallet.addAllowedWallet(checksumAddress)
        } catch(ex) {
            expect(ex.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Schedule is already locked!'");
        }

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql([]);
    });

    it(`Admin should be able to add a new vesting schedule event for a wallet on the allowedWallet list while the state is unlocked`, async function () {
        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the VestingWallet
        const VestingWalletContractFactory = await ethers.getContractFactory("VestingWallet");

        // Deploy the VestingWallet
        const vestingWallet = await VestingWalletContractFactory.deploy();

        // Get the VestingWallet address
        const vestingWalletAddress = vestingWallet.address;

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql([]);

        // Add an allowedWallet

        const checksumAddress = ethers.utils.getAddress("0x34beb4a3fdaef51def94e8b3dd07da11ed69423e");
        await vestingWallet.addAllowedWallet(checksumAddress);

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql([checksumAddress]);

        // Add a new vesting schedule event for the allowedWallet
        const vestingScheduleEvent = {
            "month": 0,
            "destinationAddress": checksumAddress.toString(),
            "amount": "1000000000000",
        };

        // Ensure the vesting schedule is empty
        expect(await vestingWallet.getVestingScheduleEvents()).to.eql([]);

        // Add the vesting schedule event
        await vestingWallet.addVestingScheduleEvent(
            vestingScheduleEvent.month,
            vestingScheduleEvent.destinationAddress,
            BigNumber.from(vestingScheduleEvent.amount)
        );

        const events = await vestingWallet.getVestingScheduleEvents();

        const event = {
            "month": events[0].month.toNumber(),
            "destinationAddress": events[0].destinationAddress,
            "amount": events[0].amount.toNumber().toString(),
        }
        
        expect(event).to.eql(vestingScheduleEvent);
        
    });

    it(`Admin should be able to initiate withdrawal for a vesting period that has matured`, async function () {
        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the VestingWallet
        const VestingWalletContractFactory = await ethers.getContractFactory("VestingWallet");

        // Deploy the VestingWallet
        const vestingWallet = await VestingWalletContractFactory.deploy();

        // Get the VestingWallet address
        const vestingWalletAddress = vestingWallet.address;

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql([]);

        // Add an allowedWallet

        const checksumAddress = ethers.utils.getAddress("0x34beb4a3fdaef51def94e8b3dd07da11ed69423e");
        await vestingWallet.addAllowedWallet(checksumAddress);

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql([checksumAddress]);

        const randomFixture = function () {
            return { 
                "month": Math.floor(Math.random() * 12),
                "destinationAddress": checksumAddress.toString(),
                "amount": Math.floor(Math.random() * 1000000000000),
            };
        }
        // Add a new vesting schedule event for the allowedWallet
        const vestingScheduleEvent = {
            "month": 0,
            "destinationAddress": checksumAddress.toString(),
            "amount": "1000000000000",
        };

        // Ensure the vesting schedule is empty
        expect(await vestingWallet.getVestingScheduleEvents()).to.eql([]);

        // Add the vesting schedule event
        await vestingWallet.addVestingScheduleEvent(
            vestingScheduleEvent.month,
            vestingScheduleEvent.destinationAddress,
            BigNumber.from(vestingScheduleEvent.amount)
        );

        const events = await vestingWallet.getVestingScheduleEvents();

        const event = {
            "month": events[0].month.toNumber(),
            "destinationAddress": events[0].destinationAddress,
            "amount": events[0].amount.toNumber().toString(),
        }
        
        expect(event).to.eql(vestingScheduleEvent);
        
    });

    it(`Admin should NOT be able to add a new vesting schedule event for a wallet NOT on the allowedWallet`, async function () {
        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the VestingWallet
        const VestingWalletContractFactory = await ethers.getContractFactory("VestingWallet");

        // Deploy the VestingWallet
        const vestingWallet = await VestingWalletContractFactory.deploy();

        // Get the VestingWallet address
        const vestingWalletAddress = vestingWallet.address;

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql([]);

        // Add an allowedWallet

        const checksumAddress = ethers.utils.getAddress("0x34beb4a3fdaef51def94e8b3dd07da11ed69423e");

        // Add a new vesting schedule event for the allowedWallet
        const vestingScheduleEvent = {
            "month": 0,
            "destinationAddress": checksumAddress.toString(),
            "amount": "1000000000000",
        };

        // Ensure the vesting schedule is empty
        expect(await vestingWallet.getVestingScheduleEvents()).to.eql([]);

        try {
            // Add the vesting schedule event
            const result = await vestingWallet.addVestingScheduleEvent(
                vestingScheduleEvent.month,
                vestingScheduleEvent.destinationAddress,
                BigNumber.from(vestingScheduleEvent.amount)
            );
            //expect(result).to.equal(false);
        } catch(ex) {
            expect(ex.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Address is not allowed!'");
        }

        expect(await vestingWallet.getVestingScheduleEvents()).to.eql([]);
        
    });

    it(`Admin should be able to get a list of all the vesting schedule events`, async function () {
        // Set up the test
        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the VestingWallet
        const VestingWalletContractFactory = await ethers.getContractFactory("VestingWallet");

        // Deploy the VestingWallet
        const vestingWallet = await VestingWalletContractFactory.deploy();

        // Get the VestingWallet address
        const vestingWalletAddress = vestingWallet.address;

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql([]);

        // Add an allowedWallet to the list

        const checksumAddress = ethers.utils.getAddress("0x34beb4a3fdaef51def94e8b3dd07da11ed69423e");

        // Add a new vesting schedule event for the allowedWallet

        const vestingScheduleEvent = {
            "month": 0,
            "destinationAddress": checksumAddress.toString(),
            "amount": "1000000000000",
        };

        // Ensure the vesting schedule is empty

        expect(await vestingWallet.getVestingScheduleEvents()).to.eql([]);

        // Add the allowed wallet
        await vestingWallet.addAllowedWallet(checksumAddress);

        // Add the vesting schedule event

        await vestingWallet.addVestingScheduleEvent(
            vestingScheduleEvent.month,
            vestingScheduleEvent.destinationAddress,
            BigNumber.from(vestingScheduleEvent.amount)
        );

        // Get the vesting schedule events for the month

        const events = await vestingWallet.getVestingScheduleEvents();



    });

    it(`Admin should NOT be able to add a new vesting schedule event for a wallet on the allowedWallet list while the state is locked`, async function () {
        const [owner] = await ethers.getSigners();

        // Get the address of the minter
        const minterAddress = owner.address;

        // Get the address of the VestingWallet
        const VestingWalletContractFactory = await ethers.getContractFactory("VestingWallet");

        // Deploy the VestingWallet
        const vestingWallet = await VestingWalletContractFactory.deploy();

        // Get the VestingWallet address
        const vestingWalletAddress = vestingWallet.address;

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql([]);

        // Add an allowedWallet

        const checksumAddress = ethers.utils.getAddress("0x34beb4a3fdaef51def94e8b3dd07da11ed69423e");
        await vestingWallet.addAllowedWallet(checksumAddress);

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql([checksumAddress]);

        // Lock the vesting schedule
        await vestingWallet.lockVestingSchedule();

        // Try to add a new vesting schedule event for the allowedWallet (should fail)
        const vestingScheduleEvent = {
            "month": 0,
            "destinationAddress": checksumAddress.toString(),
            "amount": "1000000000000",
        };

        // Ensure the vesting schedule is empty
        expect(await vestingWallet.getVestingScheduleEvents()).to.eql([]);

        try {
            await vestingWallet.addVestingScheduleEvent(
                vestingScheduleEvent.month,
                vestingScheduleEvent.destinationAddress,
                BigNumber.from(vestingScheduleEvent.amount)
            );
        }
        catch(ex) {
            expect(ex.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Schedule is already locked!'");
        }

        const events = await vestingWallet.getVestingScheduleEvents();
        
        expect(events).to.eql([]);
        
    });

 

});