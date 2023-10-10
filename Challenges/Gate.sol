// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Gate {
    bool public locked = true;
    address public studentWallet;
    uint256 public timestamp = block.timestamp;
    uint8 private number1 = 10;
    uint16 private number2 = 255;
    bytes32 private _secret;

    constructor(address _sw, bytes32 _s) {
        studentWallet = _sw;
        _secret = _s;
    }

    modifier onlyThis() {
        require(msg.sender == address(this), "Only the contract can call this");
        _;
    }

    function resolve(bytes memory _data) public {
        require(msg.sender != tx.origin);
        (bool success, ) = address(this).call(_data);
        require(success, "call failed");
    }

    function unlock(bytes memory _data) public onlyThis {
        require(bytes16(_data) == bytes16(_secret));
        locked = false;
    }

    function isSolved() public view returns (bool) {
        return !locked;
    }
}
