import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import * as fs from 'fs';

const domainsPath = '"../../contracts/nfts/Domains.cdc"';
const nonFungibleTokenPath =
  '"../../contracts/interfaces/NonFungibleToken.cdc"';
const fungibleTokenPath =
  '"../../contracts/interfaces/FungibleToken.cdc"';

class DomainsTokenService {
  constructor(
    domainsTokenAddress,
    nonFungibleTokenAddress,
    fungibleTokenAddress,
    flowService
  ) {
    this.domainsTokenAddress = domainsTokenAddress;
    this.nonFungibleTokenAddress = nonFungibleTokenAddress;
    this.fungibleTokenAddress = fungibleTokenAddress;
    this.flowService = flowService;
  }

  mint = async (name, duration) => {
    const authorization = this.flowService.authorizeMinter();

    const filePath = new URL(
      '../../../cadence/transactions/domains/registerDomain.cdc',
      import.meta.url
    );
    const transaction = fs
      .readFileSync(filePath, {
        encoding: 'utf8',
      })
      .replace(domainsPath, fcl.withPrefix(this.domainsTokenAddress))
      .replace(
        fungibleTokenPath,
        fcl.withPrefix(this.fungibleTokenAddress)
      )
      .replace(
        nonFungibleTokenPath,
        fcl.withPrefix(this.nonFungibleTokenAddress)
      );

    return this.flowService.sendTx({
      transaction,
      args: [fcl.arg(name, t.String), fcl.arg(duration, t.UFix64)],
      authorizations: [authorization],
      payer: authorization,
      proposer: authorization,
    });
  };

  getAccountCollection = async (address) => {
    const filePath = new URL(
      '../../../cadence/scripts/domains/getAccountCollection.cdc',
      import.meta.url
    );
    const script = fs
      .readFileSync(filePath, {
        encoding: 'utf8',
      })
      .replace(domainsPath, fcl.withPrefix(this.domainsTokenAddress))
      .replace(
        nonFungibleTokenPath,
        fcl.withPrefix(this.nonFungibleTokenAddress)
      );

    return this.flowService.executeScript({
      script,
      args: [fcl.arg(address, t.Address)],
    });
  };
}

export { DomainsTokenService };
