const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token contract", function () {
  it(`Deployment should assign the total supply of tokens to the creator`, async function () {
    const [owner] = await ethers.getSigners();
    const DubsContractFactory = await ethers.getContractFactory("Dubs");
    const dubsToken = await DubsContractFactory.deploy();
    const ownerBalance = await dubsToken.balanceOf(owner.address);
    expect(await dubsToken.totalSupply()).to.equal(ownerBalance);
  });
  it(`Should have the symbol DUBS`, async function () {
    const [owner] = await ethers.getSigners();
    const DubsContractFactory = await ethers.getContractFactory("Dubs");
    const dubsToken = await DubsContractFactory.deploy();
    expect(await dubsToken.symbol()).to.equal('DUBS');
  });
  it(`Should have 3.5b total supply`, async function () {
    const [owner] = await ethers.getSigners();
    const DubsContractFactory = await ethers.getContractFactory("Dubs");
    const dubsToken = await DubsContractFactory.deploy();
    expect(await dubsToken.totalSupply()).to.equal("3500000000000000000000000000");
  });
  it(`Should have the name 'Aftermath Islands Doubloon'`, async function () {
    const [owner] = await ethers.getSigners();
    const DubsContractFactory = await ethers.getContractFactory("Dubs");
    const dubsToken = await DubsContractFactory.deploy();
    expect(await dubsToken.name()).to.equal('Aftermath Islands Doubloon');
  });
  it(`Should have 18 decimals`, async function () {
    const [owner] = await ethers.getSigners();
    const DubsContractFactory = await ethers.getContractFactory("Dubs");
    const dubsToken = await DubsContractFactory.deploy();
    expect(await dubsToken.decimals()).to.equal(18);
  });
  it(`Should be spent by the minter`, async function () {
    const [owner] = await ethers.getSigners();
    const DubsContractFactory = await ethers.getContractFactory("Dubs");
    const dubsToken = await DubsContractFactory.deploy();
    // Get the signer
    const signer = await ethers.provider.getSigner(owner.address);
    // Get the contract
    const contract = new ethers.Contract(dubsToken.address, dubsToken.interface, signer);
    // Spend some tokens
    await contract.transfer("0x34beb4a3fdaef51def94e8b3dd07da11ed69423e", "1000000000000000000000000000");
    // Check the balance
    expect(await dubsToken.balanceOf("0x34beb4a3fdaef51def94e8b3dd07da11ed69423e")).to.equal("1000000000000000000000000000");
    // Check the balance of the sender
    expect(await dubsToken.balanceOf(owner.address)).to.equal("2500000000000000000000000000");
  });
  

});