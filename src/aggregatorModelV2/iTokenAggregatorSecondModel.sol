// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "./iTokenAggregatorModel.sol";

contract iTokenAggregatorSecondModel is iTokenAggregatorModel {
    function _getInterestUnit()
        internal
        view
        virtual
        override
        returns (uint256)
    {
        return block.timestamp;
    }

    function _getAccrualInterestUnit(
        IiToken _iToken
    ) internal view virtual override returns (uint256) {
        return _iToken.getAccrualInterestUnit();
    }

    function _getBorrowRatePerUnit(
        IiToken _iToken
    ) internal view virtual override returns (uint256) {
        return _iToken.borrowRatePerUnit();
    }
}
