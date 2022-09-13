
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DUBS is ERC20Permit {
  uint256 public constant INITIAL_SUPPLY = 3500000000; // 1 billion
  address public constant TREASURY_ADDRESS = 0xafD4F8FA116F5d75deBB1330969220dCe3e0c751;
  constructor()
    ERC20("Aftermath Islands Doubloon", "DUBS")
    ERC20Permit("Aftermath Islands Doubloon")
  {
    _mint(TREASURY_ADDRESS, INITIAL_SUPPLY * 1e18);
  }
}

