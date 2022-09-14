const fs = require('fs');

async function loadAllowedAddressesFromFile(file) {
    // Load the CSV
    try {
        const csv = fs.readFileSync(file, 'utf8');

        // Split the CSV into lines
        const lines = csv.split('\n');

        return lines;
    }
    catch(ex) {
        console.log(ex);
        return [];
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

        // Load a list of allowed addresses from a CSV file
        const allowedAddresses = await loadAllowedAddressesFromFile('./csv/allowed_addresses.csv');

        // Add the allowed addresses to the vesting wallet
        for (let i = 0; i < allowedAddresses.length; i++) {
            const address = allowedAddresses[i];
            const addAddressResult = await vestingWallet.addAllowedWallet(address);
        }
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