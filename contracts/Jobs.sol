pragma solidity ^0.4.23;

contract Jobs {
  address public owner;

  string public version = '0.0.1';

  constructor() public {
    owner = msg.sender;
  }

  modifier restricted() {
    if (msg.sender == owner) _;
  }

}
