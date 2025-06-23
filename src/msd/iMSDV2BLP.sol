// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./iMSDV2.sol";

interface IControllerBLP {
    function refreshEligibility(address _accounts) external;

    function refreshEligibilities(address[] memory _accounts) external;
}

/**
 * @title dForce's Lending Protocol Contract.
 * @notice iTokens token for the Multi-currency Stable Debt Token.
 * @author dForce Team.
 */
contract iMSDV2BLP is iMSDV2 {
    function borrow(uint256 _borrowAmount, bool refreshEligibility) external {
        super.borrow(_borrowAmount);

        if (refreshEligibility) {
            IControllerBLP(address(controller)).refreshEligibility(msg.sender);
        }
    }

    function repayBorrow(
        uint256 _repayAmount,
        bool refreshEligibility
    ) external {
        super.repayBorrow(_repayAmount);

        if (refreshEligibility) {
            IControllerBLP(address(controller)).refreshEligibility(msg.sender);
        }
    }

    function repayBorrowBehalf(
        address _borrower,
        uint256 _repayAmount,
        bool refreshEligibility
    ) external {
        super.repayBorrowBehalf(_borrower, _repayAmount);

        if (refreshEligibility) {
            IControllerBLP(address(controller)).refreshEligibility(_borrower);
        }
    }

    function liquidateBorrow(
        address _borrower,
        uint256 _repayAmount,
        address _assetCollateral,
        bool refreshEligibility
    ) external {
        super.liquidateBorrow(_borrower, _repayAmount, _assetCollateral);

        if (refreshEligibility) {
            address[] memory accounts = new address[](2);
            accounts[0] = _borrower;
            accounts[1] = msg.sender;
            IControllerBLP(address(controller)).refreshEligibilities(accounts);
        }
    }
}
