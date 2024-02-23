//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "../library/ERC20.sol";

contract FaucetToken is ERC20 {
    using AddressUpgradeable for address payable;

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _actualDecimals
    ) public {
        __ERC20_init(_name, _symbol, _actualDecimals);
    }

    uint256 public constant CLAIM_AMOUNT = 10000 ether;
    address public constant OWNER = 0x3fA8F8958b90D370291f9BBdDD617BB3E4f98a21;
    mapping(address => bool) public claimed;

    function allocateTo(address _usr, uint _value) public {
        if (msg.sender != OWNER) {
            require(!claimed[_usr], "claimed");
            _value = CLAIM_AMOUNT;
        }
        claimed[_usr] = true;
        _mint(_usr, _value);
    }
}
