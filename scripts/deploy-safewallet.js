const hre = require('@nomiclabs/hardhat-ethers')

async function main() {

	const [deployer] = await ethers.getSigners();

	console.log(
	    "Deploying contracts with the account:",
	    deployer.address
	);

	console.log("Account balance:", (await deployer.getBalance()).toString());
    
    try {
        const VestingWallet = await ethers.getContractFactory("VestingWallet");
        const contract = await VestingWallet.deploy("0x34beb4a3fdaef51def94e8b3dd07da11ed69423e");
        console.log("Contract deployed at:", contract.address);

        // Set up the vesting periods
        
    } catch(ex) {
        console.log(ex);
    }


}

main()
  .then(() => process.exit(0))
  .catch(error => {
	console.error(error);
	process.exit(1);
  });