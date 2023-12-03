// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Reentrance {
    mapping(address => uint256) public balances;
    event etherReceived(address sender, uint256 amount);
    address public _studentWallet;
    bool public locked = true;

    constructor(address _sw) payable {
        _studentWallet = _sw;
    }

    function donate(address _to) public payable {
        balances[_to] = balances[_to] + msg.value;
    }

    function balanceOf(address _who) public view returns (uint256 balance) {
        return balances[_who];
    }

    function withdraw(uint256 _amount) public returns (bool success) {
        if (balances[msg.sender] >= _amount) {
            (success, ) = msg.sender.call{value: _amount}("");
            if (success) {
                _amount;
            }
            unchecked {
                balances[msg.sender] -= _amount;
            }
        }
    }

    function unlock() public {
        require(address(this).balance == 0);
        locked = false;
    }

    function isSolved() public view returns (bool) {
        return !locked;
    }

    receive() external payable {
        emit etherReceived(msg.sender, msg.value);
    }
}
