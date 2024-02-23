import * as hre from "hardhat";
import {setTimeLockStrategyData} from "../utils/operations";

async function main() {
  await setTimeLockStrategyData(hre);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
