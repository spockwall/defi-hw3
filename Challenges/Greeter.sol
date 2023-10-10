// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Greeter {
    address public _studentWallet;
    bool public locked = true;
    event etherReceived(address sender, uint256 amount);

    constructor(address _sw) {
        _studentWallet = _sw;
    }

    modifier onlyStudent() {
        require(
            msg.sender == _studentWallet,
            "only one student wallet can call"
        );
        _;
    }

    function unlock() public onlyStudent {
        require(
            address(this).balance >= 100000000000000,
            "please send 0.0001 ether to unlock"
        );
        locked = false;
    }

    function isSolved() public view returns (bool) {
        return !locked;
    }

    receive() external payable onlyStudent {
        emit etherReceived(msg.sender, msg.value);
    }
}
