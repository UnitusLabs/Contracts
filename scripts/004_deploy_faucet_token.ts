import * as hre from "hardhat";
import {deploy, execute} from "../utils/deployContracts";

async function main() {
  const {getNamedAccounts, deployments} = hre;
  const {deployer, faucetSuper} = await getNamedAccounts();

  // const ARB = await deploy(hre, "ARB", "FaucetToken", ["Arbitrum", "ARB", 18]);
  // const MAI = await deploy(hre, "MAI", "FaucetToken", [
  //   "Mai Stablecoin",
  //   "MAI",
  //   18,
  // ]);
  // const rETH = await deploy(hre, "rETH", "FaucetToken", [
  //   "Rocket Pool ETH",
  //   "rETH",
  //   18,
  // ]);

  const frax = await deploy(hre, "Frax", "FaucetToken", ["Frax", "FRAX", 18]);
  //   await execute(hre, "ARB", faucetSuper, "allocateTo", faucetSuper, 1);
  //   deployments.log(await deployments.read("ARB", "balanceOf", faucetSuper));

  //   await execute(hre, "MAI", faucetSuper, "allocateTo", faucetSuper, 1);
  //   deployments.log(await deployments.read("MAI", "balanceOf", faucetSuper));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
