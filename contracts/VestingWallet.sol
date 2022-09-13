pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VestingWallet is Ownable {
    uint256 public startTime;
    bool public isLocked = false;
    ERC20 public token;
    uint256 public monthLengthDays = 28 days;

    struct VestingScheduleEvent {
        uint month;
        address destinationAddress;
        uint amount;
        bool hasRun;
    }

    VestingScheduleEvent[] vestingScheduleEvents;

    function addVestingScheduleEvent(uint _month, address _destinationAddress, uint _amount) public onlyOwner {
        // Do not allow modification of the vesting schedule once it has been locked
        require(
            isVestingScheduleLocked() == false,
            "Schedule is already locked!"
        );

        if(isAddressInWithdrawalWhitelist(_destinationAddress)) {
            vestingScheduleEvents.push(VestingScheduleEvent(_month, _destinationAddress, _amount, false));
        }
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
        for (uint i = 0; i < vestingScheduleEvents.length; i++) {
            // Make sure the current time is after the vesting vesting period.
            require(block.timestamp >= startTime + vestingScheduleEvents[i].month * monthLengthDays,
                    "Vesting period has not passed yet"
            );

            if (vestingScheduleEvents[i].month == month && vestingScheduleEvents[i].hasRun == false) {
                vestingScheduleEvents[i].hasRun = true;
                token.transfer(vestingScheduleEvents[i].destinationAddress, vestingScheduleEvents[i].amount);
            }
        }
    }

    function getCurrentMonth() public view returns (uint) {
        return (block.timestamp - startTime) / monthLengthDays;
    }

    // In the final version this can be hardcoded into the contract
    address[] public allowedWallets;

    function getVestingScheduleEvents() public view returns (VestingScheduleEvent[] memory) {
        return vestingScheduleEvents;
    }

    function getAllowedWallets() public view returns (address[] memory) {
        return allowedWallets;
    }

    constructor()
    {
        startTime = block.timestamp;
        isLocked = false;
    }

}