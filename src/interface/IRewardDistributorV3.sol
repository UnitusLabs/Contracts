//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "../Controller.sol";

interface IRewardDistributorV3 {
    function isRewardDistributor() external view returns (bool);

    function controller() external view returns (Controller);

    function rewardToken() external returns (address);

    function _setRewardToken(address newRewardToken) external;

    /// @notice Emitted reward token address is changed by admin
    event NewRewardToken(address oldRewardToken, address newRewardToken);

    function treasury() external returns (address);

    function _setTreasury(address newTreasury) external;

    /// @notice Emitted treasury address is changed by admin
    event NewTreasury(address oldTreasury, address newTreasury);

    function _addRecipient(
        address _iToken,
        uint256 _distributionFactor
    ) external;

    event NewRecipient(address iToken, uint256 distributionFactor);

    /// @notice Emitted when mint is paused/unpaused by admin
    event Paused(bool paused);

    function _pause() external;

    function _unpause(
        address[] calldata _borrowiTokens,
        uint256[] calldata _borrowSpeeds,
        address[] calldata _supplyiTokens,
        uint256[] calldata _supplySpeeds
    ) external;

    /// @notice Emitted when Global Distribution speed for both supply and borrow are updated
    event GlobalDistributionSpeedsUpdated(
        uint256 borrowSpeed,
        uint256 supplySpeed
    );

    /// @notice Emitted when iToken's Distribution borrow speed is updated
    event DistributionBorrowSpeedUpdated(address iToken, uint256 borrowSpeed);

    /// @notice Emitted when iToken's Distribution supply speed is updated
    event DistributionSupplySpeedUpdated(address iToken, uint256 supplySpeed);

    /// @notice Emitted when iToken's Distribution factor is changed by admin
    event NewDistributionFactor(
        address iToken,
        uint256 oldDistributionFactorMantissa,
        uint256 newDistributionFactorMantissa
    );

    function updateDistributionState(address _iToken, bool _isBorrow) external;

    function updateReward(
        address _iToken,
        address _account,
        bool _isBorrow
    ) external;

    function updateRewardBatch(
        address[] memory _holders,
        address[] memory _iTokens
    ) external;

    function claimReward(
        address[] memory _holders,
        address[] memory _iTokens
    ) external;

    function claimAllReward(address[] memory _holders) external;

    function claimRewards(
        address[] memory _holders,
        address[] memory _suppliediTokens,
        address[] memory _borrowediTokens
    ) external;

    /// @notice Emitted when reward of amount is distributed into account
    event RewardDistributed(
        address iToken,
        address account,
        uint256 amount,
        uint256 accountIndex
    );
}

interface IRewardDistributorSecondV3 is IRewardDistributorV3 {
    function _upgrade(address _iToken) external;
}
