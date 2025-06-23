import * as hre from "hardhat";
import {execute} from "../utils/deployContracts";

async function main() {
  const {getNamedAccounts, deployments, ethers} = hre;
  const {deployer, owner} = await getNamedAccounts();

  const vUSDT = await deployments.get("vUSDT");
  const vRWA = await deployments.get("vRWA");

  const vRWAAmount = ethers.parseUnits("1000", 18);
  const vUSDTAmount = ethers.parseUnits("100", 6);

  await execute(hre, "RWA", deployer, "mint", deployer, vRWAAmount);
  await execute(hre, "RWA", deployer, "approve", vRWA.address, vRWAAmount);
  await execute(
    hre,
    "vRWA",
    deployer,
    "mintForSelfAndEnterMarket(uint256)",
    vRWAAmount
  );

  await execute(hre, "USDT", deployer, "approve", vUSDT.address, vUSDTAmount);
  await execute(
    hre,
    "vUSDT",
    deployer,
    "mint(address,uint256)",
    deployer,
    vUSDTAmount
  );
  await execute(hre, "vUSDT", deployer, "borrow(uint256)", vUSDTAmount);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
