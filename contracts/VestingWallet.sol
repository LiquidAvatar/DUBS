pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;
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
        uint256 amount;
        bool hasRun;
    }

    VestingScheduleEvent[] vestingScheduleEvents;

    function setVestingSchedule(VestingScheduleEvent[] memory _vestingScheduleEvents) public onlyOwner {
        require(isLocked == false, "Vesting schedule is locked");

        // Clear the vesting schedule before we begin
        delete vestingScheduleEvents;

        for(uint i = 0; i < _vestingScheduleEvents.length; i++) {
            // Check that the destinaton address is in the whitelist
            if(isAddressInWithdrawalWhitelist(_vestingScheduleEvents[i].destinationAddress)) {
                vestingScheduleEvents.push(_vestingScheduleEvents[i]);
            } else {
                // Reset the vesting schedule memory. This is a security precaution. Do not remove.
                delete vestingScheduleEvents;
            }
        }
    }

    function addVestingScheduleEvent(uint _month, address _destinationAddress, uint256 _amount) public onlyOwner {
        // Do not allow modification of the vesting schedule once it has been locked
        require(
            isVestingScheduleLocked() == false,
            "Schedule is already locked!"
        );

        require(
            isAddressInWithdrawalWhitelist(_destinationAddress) == true,
            "Address is not allowed!"
        );

        vestingScheduleEvents.push(VestingScheduleEvent(_month, _destinationAddress, _amount, false));
        
    }

    function resetVestingSchedule() public onlyOwner {
        // Do not allow modification of the vesting schedule once it has been locked
        require(
            isVestingScheduleLocked() == false,
            "Schedule is already locked!"
        );

        delete vestingScheduleEvents;

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

    function withdraw(uint month) onlyOwner public {
        require(
            isVestingScheduleLocked() == true,
            "Schedule is not locked yet!"
        );

        require(
            block.timestamp >= startTime + (month * monthLengthDays),
            "The specified months vesting schedule is not runnable yet"
        );

        for (uint i = 0; i < vestingScheduleEvents.length; i++) {
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