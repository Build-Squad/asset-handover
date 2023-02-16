import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import * as fs from 'fs';

const blpTokenPath = '"../../contracts/tokens/BlpToken.cdc"';
const fungibleTokenPath =
  '"../../contracts/interfaces/FungibleToken.cdc"';

class BlpTokenService {
  constructor(blpTokenAddress, fungibleTokenAddress, flowService) {
    this.blpTokenAddress = blpTokenAddress;
    this.fungibleTokenAddress = fungibleTokenAddress;
    this.flowService = flowService;
  }

  mint = async (amount) => {
    const authorization = this.flowService.authorizeMinter();

    const filePath = new URL(
      '../../../cadence/transactions/blp/mintTokens.cdc',
      import.meta.url
    );
    const transaction = fs
      .readFileSync(filePath, {
        encoding: 'utf8',
      })
      .replace(blpTokenPath, fcl.withPrefix(this.blpTokenAddress));

    return this.flowService.sendTx({
      transaction,
      args: [fcl.arg(amount, t.UFix64)],
      authorizations: [authorization],
      payer: authorization,
      proposer: authorization,
    });
  };

  getAccountBalance = async (address) => {
    const filePath = new URL(
      '../../../cadence/scripts/blp/getAccountBalance.cdc',
      import.meta.url
    );
    const script = fs
      .readFileSync(filePath, {
        encoding: 'utf8',
      })
      .replace(
        fungibleTokenPath,
        fcl.withPrefix(this.fungibleTokenAddress)
      )
      .replace(blpTokenPath, fcl.withPrefix(this.blpTokenAddress));

    return this.flowService.executeScript({
      script,
      args: [fcl.arg(address, t.Address)],
    });
  };
}

export { BlpTokenService };
