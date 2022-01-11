# auto-redeem-rome-bond

## Disclaimer

Exporting your private key is extremely dangerous! If you don't know hot to keep it safe, you **SHOULD NOT** export or input it.

It is not necessary to use the private key, you can still use this script without exporting it.

## Quick Start

1. Config `.env` file. ⚠️ For security reason, you can use this script without setting seed phase/private key in `.env` file, if you do so, you will need to redeem bond manually.
2. Add your bond contract. gOHM bond contract was already added. You can find all bond contracts here.
3. Copy abi file as json format, add it in the `abi` folder.
4. Run `yarn compile:abi`, you'll see a new factory class in `contracts/index.ts`.
5. Modify `index.ts`, replace `GOHMBond__factory` with your targe contract factory class.
6. Run `yarn compile && yarn start`.
