const hre = require('@nomiclabs/hardhat-ethers')

async function main() {

	const [deployer] = await ethers.getSigners();

	console.log(
		"Deploying contracts with the account:",
		deployer.address
	);

	console.log("Account balance:", (await deployer.getBalance()).toString());

	const DubsContract = await ethers.getContractFactory("Dubs");
	const contract = await DubsContract.deploy();

	console.log("Contract deployed at:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
	console.error(error);
	process.exit(1);
});