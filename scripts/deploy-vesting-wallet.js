const hre = require('@nomiclabs/hardhat-ethers')
const fs = require('fs');

async function generateVestingEventsFromCSV() {
    // Load the CSV 
    const csv = fs.readFileSync('../csv/vesting.csv', 'utf8');

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

}

async function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

async function main() {

	const [deployer] = await ethers.getSigners();

	console.log(
	    "Deploying contracts with the account:",
	    deployer.address
	);

	console.log("Account balance:", (await deployer.getBalance()).toString());
    
    try {
        const VestingWallet = await ethers.getContractFactory("VestingWallet");
        const contract = await VestingWallet.deploy();
        console.log("Contract deployed at:", contract.address);
        await wait(4000);
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