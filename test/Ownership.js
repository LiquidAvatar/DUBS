const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

const fs = require('fs');


describe("Ownership", function () {
    it(`The contract ownership should not be transferrable`, async function () {
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

        try {
            expect(await vestingWallet.transferOwnership("0x34beb4a3fdaef51def94e8b3dd07da11ed69423e"))
            expect(false).to.equal(true);
        } catch(ex) {
            expect(ex.message).to.equal(`VM Exception while processing transaction: reverted with reason string 'The ownership of this contract cannot be transferred'`)
        }

        expect(await vestingWallet.owner()).to.equal(minterAddress);

    });

    it(`The contract ownership should not be renouncable`, async function () {
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

        try {
            expect(await vestingWallet.renounceOwnership())
            expect(false).to.equal(true);
        } catch(ex) {
            expect(ex.message).to.equal(`VM Exception while processing transaction: reverted with reason string 'The ownership of this contract cannot be renounced'`)
        }

        expect(await vestingWallet.owner()).to.equal(minterAddress);

    });

})