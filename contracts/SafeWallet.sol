pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SafeWallet is Ownable {
    uint256 public startTime;
    bool public isLocked = false;
    ERC20 public token;
    uint256 public monthLengthDays = 30 days;

    struct VestingPeriod {
        uint month;
        address destinationAddress;
        uint amount;
        bool hasRun;
    }

    VestingPeriod[] vestingPeriods;

    function setVestingPeriod(uint _month, address _destinationAddress, uint _amount) public onlyOwner {
        // Do not allow modification of the vesting schedule once it has been locked
        require(
            isVestingScheduleLocked() == false,
            "Schedule is already locked!"
        );
        // Require the destinationAddress to be in the hard-coded array of wallets
        for(uint i = 0; i < vestingPeriods.length; i++) {
            require(
                isAddressInWithdrawalWhitelist(_destinationAddress),
                "Destination is not in whitelist!"
            );
        }

        vestingPeriods.push(VestingPeriod(_month, _destinationAddress, _amount, false));
    }

    function isAddressInWithdrawalWhitelist(address _address) public view returns (bool) {
        for(uint i = 0; i < allowedWallets.length; i++) {
            if(allowedWallets[i] == _address) {
                return true;
            }
        }
        return false;
    }

    function setStartPeriod(uint _startTime) public onlyOwner {
        require(
            isVestingScheduleLocked() == false,
            "Schedule is already locked!"
        );
        startTime = _startTime;
    }

    function isVestingScheduleLocked() public view returns (bool) {
        return isLocked;
    }

    function setToken(address _token) public onlyOwner {
        require(
            isVestingScheduleLocked() == false,
            "Schedule is already locked!"
        );
        token = ERC20(_token);
    }

    function lockVestingSchedule() public onlyOwner {
        isLocked = true;
    }

    function addAllowedWallet(address _address) public onlyOwner {
        require(
            isVestingScheduleLocked() == false,
            "Schedule is already locked!"
        );
        allowedWallets.push(_address);
    }

    function runMonthlyWithdrawal(uint month) onlyOwner public {
        require(
            isVestingScheduleLocked() == true,
            "Schedule is not locked yet!"
        );
        for (uint i = 0; i < vestingPeriods.length; i++) {
            // Make sure the current time is after the vesting vesting period.
            require(block.timestamp >= startTime + vestingPeriods[i].month * monthLengthDays,
                    "Vesting period has not passed yet"
            );

            if (vestingPeriods[i].month == month && vestingPeriods[i].hasRun == false) {
                vestingPeriods[i].hasRun = true;
                token.transfer(vestingPeriods[i].destinationAddress, vestingPeriods[i].amount);
            }
        }
    }

    // In the final version this can be hardcoded into the contract
    address[] public allowedWallets;

    constructor()
    {
        startTime = block.timestamp;
        isLocked = false;
    }

    bool[] public hasWithdrawalBeenExecutedForMonth;

}