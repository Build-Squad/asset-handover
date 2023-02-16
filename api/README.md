# Asset-handover API
The Asset-handover API is a RESTful API built with [express](https://expressjs.com/) that sends transactions to Flow using the [Flow JS SDK](https://github.com/onflow/fcl-js/tree/master/packages/sdk). It contains endpoints for the [Asset-handover](src/services/assetHandover.js), the [BLP token](src/services/blpToken.ts) and [Domains token](src/services/domainsToken.ts) services to read & write data to the Flow blockchain.

## Services
The Asset-handover API contains four main services. These services synchronize data between the blockchain, and also provide API endpoints that could be consumed by the asset-handover client-side application.

### [Asset-Handover Service](src/services/block-cursor.ts)
This service contains functions that utilize the Flow Service to send Cadence transactions and scripts that fetch and update Asset-handover data.

You can also run the [transactions and scripts](../cadence) manually using the [Flow CLI](https://docs.onflow.org/flow-cli/).

[Exposed Endpoints](src/routes/assetHandover.js):
- **POST `/v1/asset-handover/lockUp/updateCreationFees`**: Allows the admin (deployer) of the Asset-Handover smart contract to update the fees charged for creating a lock-up. Uses [updateCreationFees.cdc](/cadence/transactions/lockUps/updateCreationFees.cdc)

- **POST `/v1/asset-handover/lockUp/updateWithdrawFees`**: Allows the admin (deployer) of the Asset-Handover smart contract to update the fees charged for withdrawing from a lock-up. Uses [updateWithdrawFees.cdc](/cadence/transactions/lockUps/updateWithdrawFees.cdc)

- **GET `/v1/asset-handover/accountLockUp/:address`**: Fetches the lock-up by holder account. Calls [getAccountLockUp.cdc](/cadence/scripts/lockups/getAccountLockUp.cdc)

- **GET `/v1/asset-handover/LockUpsByRecipient/:address`**: Fetches the lock-up by recipient account. Calls [getLockUpsByRecipient.cdc](/cadence/scripts/lockups/getLockUpsByRecipient.cdc)

- **GET `/v1/asset-handover/fungibleTokenInfoMapping`**: Fetches the fungible tokens of the Asset-handover registry. Calls [getFungibleTokenInfoMapping.cdc](/cadence/scripts/lockups/getFungibleTokenInfoMapping.cdc)

- **GET `/v1/asset-handover/nonFungibleTokenInfoMapping`**: Fetches the non fungible tokens of the Asset-handover registry. Calls [getNonFungibleTokenInfoMapping.cdc](/cadence/scripts/lockups/getNonFungibleTokenInfoMapping.cdc)

### [BLP Token Service](src/services/kitty-items.ts)
This service contains functions that utilize the Flow Service to send Cadence transactions and scripts that fetch and update BLP token data.

You can also run the [transactions and scripts](../cadence) manually using the [Flow CLI](https://docs.onflow.org/flow-cli/).

[Exposed Endpoints](src/routes/blpToken.js):
- **POST `/v1/asset-handover/blp/mint`**: Mint BLP tokens for the minter account. Calls [mintTokens.cdc](/cadence/transactions/blp/mintTokens.cdc)

- **GET `/v1/asset-handover/blp/:address`**: Fetches the balance of BLP tokens for an account. Calls [getAccountBalance.cdc](/cadence/scripts/blp/getAccountBalance.cdc)

### [Domains Token Service](src/services/domainsToken.js)
This service contains functions that utilize the Flow Service to send Cadence transactions and scripts that fetch and update Domains token data.

You can also run the [transactions and scripts](../cadence) manually using the [Flow CLI](https://docs.onflow.org/flow-cli/).

[Exposed Endpoints](src/routes/domainsToken.js):
- **GET `/v1/asset-handover/domains/accountCollection/:address`**: Fetches all the listings created by the account. Returns an array of `listing_resource_ids`. Calls [getAccountCollection.cdc](/cadence/scripts/domains/getAccountCollection.cdc)

- **POST `/v1/asset-handover/domains/mint`**: Mint Domains token for an account. Calls [registerDomain.cdc](/cadence/transactions/domains/registerDomain.cdc)

### [Flow Service](src/services/flow.ts)
This service contains functions that interact with the Flow blockchain using the [FCL JS](https://docs.onflow.org/fcl/) library. While it has no exposed endpoints, its methods used to read, write and authorize data on the chain are used extensively by its sister services.

Notable functions:
- `sendTx()`: Takes a Cadence transaction as an arguement and sends it to write data into the Flow blockchain.
- `executeScript()`: Takes a Cadence script as an arguement and executes it to read data from the Flow blockchain.
- `authorizeMinter()`: Returns an asynchronous method to authorize an account to mint tokens.

*We reuse this service from another active sample-dapp on Flow, [Kitty-items](https://github.com/onflow/kitty-items/tree/master/api#flow-service).*
