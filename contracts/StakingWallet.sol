//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract StakingWallet {
    // Use SafeMath
    using SafeMath for uint256;
    address owner;
    uint256 public requiredStakingTime = 60 days;
    bool isLocked = false;
    uint256 public bonusPercentage = 0;

    // Create a mapping to store StakingAmount
    mapping(address => DepositorStake) public stakedDeposits;

    // Let the owner set the requiredStakingTime
    constructor() {
        owner = msg.sender;
    }

    ERC20 public token;

    // Set a function to allow setting of the ERC20 by the owner
    function setERC20(address _token) onlyOwner notLocked public {
        token = ERC20(_token);
    }

    // Set a function to lock the contract and not allow further changes
    function lockContract() public onlyOwner {
        isLocked = true;
    }

    // Set up a modifier to restrict access to the owner of the contract
    modifier onlyOwner {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    // Set up a modifier to only allow access to the contract if it is not locked
    modifier notLocked {
        require(isLocked == false, "Contract is locked");
        _;
    }

    // Set up a function to set the staking time
    function setRequiredStakingTime(uint256 _requiredStakingTime) public onlyOwner notLocked {
        requiredStakingTime = _requiredStakingTime;
    }

    function setBonusPercentage(uint256 _bonusPercentage) public onlyOwner notLocked {
        bonusPercentage = _bonusPercentage;
    }

    uint16 stakingBonusPercentage = 0;

    struct DepositorStake {
        string eosRewardAddress;
        uint256 amount;
        uint256 timeDeposited;
        uint256 timeUnlockable;
    }

    // Create a function to stake tokens (deposit)
    function stakeTokens(string memory eosRewardAddress, uint256 _amount) public {
        // Get the current block timestamp
        uint256 blockTimestamp = block.timestamp;

        DepositorStake memory deposit = DepositorStake({
            eosRewardAddress: eosRewardAddress,
            amount: _amount,
            timeDeposited: blockTimestamp,
            timeUnlockable: blockTimestamp + requiredStakingTime
        });

        stakedDeposits[msg.sender] = deposit;
    }

    // Create a function to withdraw tokens (withdraw)
    function withdrawTokens() public {
        // Get the current block timestamp
        uint256 blockTimestamp = block.timestamp;

        // Get the staked amount
        uint256 stakedAmount = stakedDeposits[msg.sender].amount;

        // Get the time the tokens are unlockable
        uint256 timeUnlockable = stakedDeposits[msg.sender].timeUnlockable;

        // Check if the tokens are unlockable
        require(blockTimestamp >= timeUnlockable, "Tokens are not unlockable yet");

        // Check if the staked amount is greater than 0
        require(stakedAmount > 0, "No tokens to withdraw");

        // Transfer the tokens to the user
        token.transfer(msg.sender, stakedAmount + (stakedAmount * bonusPercentage / 100));
    }
    
}