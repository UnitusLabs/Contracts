import * as hre from "hardhat";
import {
  transferOwnershipToTimelock,
  transferOwnershipFromTimelock,
} from "../utils/operations";

async function main() {
  const {getNamedAccounts} = hre;
  const {deployer, owner} = await getNamedAccounts();

  // Don't transfer ownership for timelock itself, oracle etc.
  await transferOwnershipToTimelock(hre, deployer, owner, [
    "timelock",
    "oracle",
  ]);

  await transferOwnershipFromTimelock(hre, deployer, owner, [
    "timelock",
    "oracle",
  ]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
