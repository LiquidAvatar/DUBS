pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Dubs is ERC20Permit {
  uint256 public constant INITIAL_SUPPLY = 3500000000; // 1 billion
  constructor()
    ERC20("Aftermath Islands Doubloon", "DUBS")
    ERC20Permit("Aftermath Islands Doubloon")
  {
    // Send to the sender
    _mint(msg.sender, INITIAL_SUPPLY * 1e18);
  }
}

