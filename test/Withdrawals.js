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


describe("VestingWallet Withdrawals", function () {

    it(`It should set up a vesting schedule for the first month, freeze it, then be instantly withdrawable`, async function () {

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

        const allowedAddresses = generateRandomAllowedWallets();

        for(i = 0; i < allowedAddresses.length; i++) {
            await vestingWallet.addAllowedWallet(allowedAddresses[i]);
        }

        // Check the allowedWallets state of the VestingWallet
        expect(await vestingWallet.getAllowedWallets()).to.eql(allowedAddresses);

        // Ensure the vesting schedule is empty
        expect(await vestingWallet.getVestingScheduleEvents()).to.eql([]);


        for(addressIndex = 0; addressIndex < allowedAddresses.length; addressIndex++) {

            const vestingScheduleEvent = {
                "month": 0,
                "destinationAddress": allowedAddresses[addressIndex].toString(),
                "amount": "1000000000000",
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

        const events = await vestingWallet.getVestingScheduleEvents();
        
        expect(events.length).to.equal(allowedAddresses.length);
        

    });

});