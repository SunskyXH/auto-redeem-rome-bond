import { ethers } from "ethers";
import {
  GOHMBond__factory as Bond__factory,
  RomeStaking__factory,
} from "./contracts/index";
import chalk from "chalk";

require("dotenv").config();

// ------ init ------

const MOONRIVER_BLOCK_SPEED = 12; // 12 seconds per blocks
const REDEEM_TRIGGER_LIMIT = (15 * 60) / 12; // about 15 mins, 75 blocks

const ROME_STAKING_CONTRACT_ADDRESS =
  "0x6f7D019502e17F1ef24AC67a260c65Dd23b759f1";
const gOHM_BOND_CONTRACT_ADDRESS = "0xC82d354Cc96b5Cd0ee5B63569b5b51a2D3c5a895";
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || "";

// ------------------

const provider = new ethers.providers.JsonRpcProvider(
  "https://moonriver.api.onfinality.io/public"
);

const gOHM_BounContract = Bond__factory.connect(
  gOHM_BOND_CONTRACT_ADDRESS,
  provider
);

const RomeStakingContract = RomeStaking__factory.connect(
  ROME_STAKING_CONTRACT_ADDRESS,
  provider
);

(async () => {
  const blockNumber = await provider.getBlockNumber();
  const epoch = await RomeStakingContract.epoch();
  const bondInfo = await gOHM_BounContract.bondInfo(WALLET_ADDRESS);
  const percentVested = await gOHM_BounContract.percentVestedFor(
    WALLET_ADDRESS
  );

  const blockCountBeforeRebase = epoch.endBlock.sub(blockNumber).toNumber();
  const minutesBeforeRebase =
    (blockCountBeforeRebase * MOONRIVER_BLOCK_SPEED) / 60;
  const pending = ethers.utils.formatUnits(bondInfo.payout, "gwei");
  const claimable = ethers.utils.formatUnits(
    bondInfo.payout.mul(percentVested).div(10000),
    "gwei"
  );

  console.log(chalk`
  Wallet address: {underline.green ${WALLET_ADDRESS}}
  Next rebase: after {green ${blockCountBeforeRebase}} blocks
  Next rebase time: about {green ${minutesBeforeRebase}} mins later
  Pending: {yellow ${pending}} sROME
  Claimable: {yellow ${claimable}} sROME
  `);

  if (blockCountBeforeRebase > REDEEM_TRIGGER_LIMIT) {
    console.log(chalk`
  -- Not Now --
  Will trigger redeem after {yellowBright ${
    blockCountBeforeRebase - REDEEM_TRIGGER_LIMIT
  }} blocks.
    `);
  } else {
    const mnemonic = process.env.MNEMONIC || "";
    if (!mnemonic) {
      console.log(chalk`
  -- No Private Key Found --
  You can visit {underline.yellow  https://romedao.finance/bond/} to claim your sROME.
    `);
    } else {
      console.log(chalk`
  -- Start Redeem --
    `);
      const walletMnemonic = ethers.Wallet.fromMnemonic(mnemonic);
      const wallet = walletMnemonic.connect(provider);
      gOHM_BounContract.connect(wallet);
      const tx = await gOHM_BounContract.redeem(WALLET_ADDRESS, true);
      console.log(`Redeeming... hash: ${chalk.underline.green(tx.hash)}`);
      await tx.wait();
      console.log("Redeem complete.");
    }
  }
})();
