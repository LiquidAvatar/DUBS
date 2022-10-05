const fs = require('fs');
const { BigNumber, utils } = require("ethers");

async function generateVestingEventsFromCSV(csvFile) {
    // Load the CSV 
    try {
        const csv = fs.readFileSync(csvFile, 'utf8');

        // Split the CSV into lines
        const lines = csv.split('\n');
    
        // Split the lines into arrays
        const events = lines.map(line => line.split(','));
    
        // Convert the arrays into objects
        const vestingEvents = events.map(event => {
            try {
                const amount = parseFloat(event[2]);
                return {
                    month: event[0],
                    destinationAddress: event[1],
                    amount: amount,
                }
            }
            catch(ex) {
                console.log(ex);
            }
        });
    
        // Remove the header row
        vestingEvents.shift();
        return vestingEvents;
    }
    catch(ex) {
        console.log(ex);
    }
    
}

async function main() {

    try {

        const [deployer] = await ethers.getSigners();

        // Get an instance of the ERC20 contract
        const DubsContract = await ethers.getContractFactory("Dubs");

        // Get the address of the Dubs contract from the command line
        const dubsAddress = process.env.ERC20_ADDRESS;

        // Attach to the ERC20
        const dubs = DubsContract.attach(dubsAddress);

        // Get an instance of the VestingWallet contract
        const VestingWalletContract = await ethers.getContractFactory("VestingWallet");

        // Get the address of the VestingWallet contract from the command line
        const vestingWalletAddress = process.env.VESTING_WALLET_ADDRESS;

        // Attach to the VestingWallet
        const vestingWallet = VestingWalletContract.attach(vestingWalletAddress);

        const vestingEvents = await vestingWallet.getVestingScheduleEvents();

        console.log(vestingEvents.length);

    }
    catch(ex) {
        console.log(ex);
    }

}

main()
  .then(() => process.exit(0))
  .catch(error => {
	console.error(error);
	process.exit(1);
});