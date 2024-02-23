import * as hre from "hardhat";
import {addMarkets} from "../utils/operations";

async function main() {
  await addMarkets(hre);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
