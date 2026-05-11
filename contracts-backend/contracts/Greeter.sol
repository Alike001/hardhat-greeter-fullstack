// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Greeter {
  string public greeting;

  event GreetingChanged(string newGreeting);

  constructor(string memory _initial) {
    greeting = _initial;
  }

  function setGreeting(string memory _greeting) public {
    greeting = _greeting;
    emit GreetingChanged(_greeting);
  }
}
