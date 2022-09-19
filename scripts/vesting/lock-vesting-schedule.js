const fs = require('fs');


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

        // Lock the vesting schedule
        const setTokenResult = await vestingWallet.lockVestingSchedule();
        console.log(setTokenResult);

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