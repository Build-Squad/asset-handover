👋 Welcome to AssetHandover! This sample dapp is designed to help you learn how to start building on [Flow](https://flow.com/), while tackling a real-world problem and making use of some of the most important building-blocks needed for almost any type of dapp on Flow. It is built with [Cadence](https://developers.flow.com/cadence), Flow's resource-oriented smart contract programming language.

By following along, we hope to help you learn how to:
- Create and deploy smart contracts,
- Add admin-only functionalities to dynamically configure your dapp,
- Accept payments for the features offered by your dapp,
- Implement some of the core smart contract interfaces, namely [FungibleToken](https://github.com/onflow/flow-ft) and [NonFungibleToken](https://github.com/onflow/flow-nft),
- Dynamically integrate any implementations of the two above smart contract interfaces,
- Mint and transfer fungible tokens,
- Mint and transfer NFTs,
- Write transactions & scripts with confidence,
- Integrate user wallets with the Flow Client Library ([FCL](https://github.com/onflow/fcl-js)),
- Use this newly-acquired knowledge and take your skills to the next level

We also hope to help you understand the main concepts and best practices of Cadence, such as:
- [Resources](https://developers.flow.com/cadence/language/resources),
- [Capabilities](https://developers.flow.com/cadence/language/capability-based-access-control),
- [Account storage](https://developers.flow.com/cadence/language/accounts#account-storage),
- [Fungible tokens](https://github.com/onflow/flow-ft#fungible-token-standard),
- [Non-fungible tokens](https://github.com/onflow/flow-nft#flow-non-fungible-token-standard)

## What can this project offer ❓

`AssetHandover` is a dapp where account `holders` can grant a `recipient` the ability to `withdraw` specific `tokens` that they own (both `FungibleToken` and `NonFungibleToken`), at a future release date. Each account can only declare one recipient, as this removes the complexity of handling race conditions upon withdrawals. However, an account can be the recipient of multiple handovers. The account holder can specify which fungible tokens will be handed over and a maximum amount for each token. It is also possible to specify which non-fungible tokens will be handed over and a specific list of NFT IDs from each `NFT` Collection. The above tokens are not locked for the account holder, meaning that they can still be utilized/transferred. The recipient (or any other account) can attempt to withdraw them, at any given time, however, this will only be successful after the release date has passed, and only for the authorized recipient. One real-world scenario would be to create a digital `"will"` for one's account, or to simply add another account as a backup, in case the account holder loses access to his/her account or is no longer able to interact with it.

## ✨ Getting Started

### 1. Install Dependencies

_🛠 This project requires `NodeJS v16.x` or above._ See: [Node installation instructions](https://nodejs.org/en/) <br/>
_🛠 This project requires `flow-cli v0.39.1` or above._ See: [Flow CLI installation instructions](https://developers.flow.com/tools/flow-cli/install) <br/>

### 2. Clone the project

```bash
git clone https://github.com/Build-Squad/asset-handover.git
```

### 3. Install packages

```bash
cd asset-handover
npm install
```

## Contract Addresses

The main contracts are deployed on testnet in the following addresses. They are already pre-configured. However, you can follow the instructions and deploy them on a new emulator account, to go through the whole process of deployment & setup.

|Name|Testnet|
|----|-------|
|[BlpToken](./cadence/contracts/tokens/BlpToken.cdc)|[0xff4cc652369f3857](https://flow-view-source.com/testnet/account/0xff4cc652369f3857/contract/BlpToken)|
|[Domains](./cadence/contracts/nfts/Domains.cdc)|[0xff4cc652369f3857](https://flow-view-source.com/testnet/account/0xff4cc652369f3857/contract/Domains)|
|[AssetHandover](./cadence/contracts/AssetHandover.cdc)|[0xff4cc652369f3857](https://flow-view-source.com/testnet/account/0xff4cc652369f3857/contract/AssetHandover)

## Local development

First, run the emulator with:

```bash
flow emulator --storage-limit=false --contracts -v
```

### 1. Deploy the smart contracts

First, we need to generate a key-pair and use it to create a new emulator account. In this account we will deploy our smart contracts, which implies that this account is also the admin account.

```bash
flow keys generate --output=json > handover-admin.json

cat handover-admin.json
```

The `handover-admin.json` file, should contain 4 key/value pairs:
- `derivationPath`,
- `mnemonic`,
- `private`,
- `public`

Tip: You can install `jq`, a cli tool for handling JSON files. Install with:

```bash
# Linux
sudo apt install jq

# MacOS
brew install jq
```

With `jq` installed, you can do the following:

```bash
# This will return the value of the 'public' key.
cat handover-admin.json | jq .'public'

# This will return the value of the 'private' key.
cat handover-admin.json | jq .'private'
```

With the key-pair generated, let's create our admin account:

```bash
# Substitute $key with the 'public' key from handover-admin.json file.
flow accounts create --key $key
```

```bash
# Substitute with the resulting account address.
export ADMIN_ADDRESS=0x01cf0e2f2f715450
```

Note: The above environment variable will be available only on your current terminal session.

We can use the Flow CLI, to view the newly-created account on emulator:

```bash
flow accounts get $ADMIN_ADDRESS --network=emulator
```

Open the `flow.json` file, and fill in the values of the `address` and `key` keys, with the obtained address and the private key.

```bash
"accounts": {
    "emulator-account": {...},
    "handover-admin": {
        "address": "${address}",
        "key": "${privateKey}"
    }
}
```

Adding some FLOW tokens to our admin account:

```bash
flow transactions send ./cadence/transactions/flow/transferFlowTokens.cdc $ADMIN_ADDRESS 15000.0 --network=emulator --signer=emulator-account
```

Now, let's deploy our smart contracts to the emulator environment.

```bash
flow project deploy --network=emulator
```

To view the result of the deployment, run the following:

```bash
flow accounts get $ADMIN_ADDRESS --network=emulator

# => Output:
Address	 0x01cf0e2f2f715450
Balance	 15000.00000000
...
Contracts Deployed: 5
Contract: 'Domains'
Contract: 'FungibleTokenMetadataViews'
Contract: 'FungibleTokenSwitchboard'
Contract: 'AssetHandover'
Contract: 'BlpToken'
```

The above smart contracts, have been succesfully deployed.

### 2. Setup supported tokens

Moving on, let's setup the `FungibleToken` and `NonFungibleToken` contracts that we currently support.

```bash
# Populate our custom registry with all the tokens we currently handle.
flow transactions send ./cadence/transactions/lockUps/addTokenInfo.cdc --network=emulator --signer=handover-admin

# View the available fungible tokens.
flow scripts execute ./cadence/scripts/lockUps/getFungibleTokenInfoMapping.cdc --network=emulator

# => Output:
Result: {"A.01cf0e2f2f715450.BlpToken": A.01cf0e2f2f715450.AssetHandover.FungibleTokenInfo(name: "BLP", receiverPath: /public/blpTokenReceiver, balancePath: /public/blpTokenMetadata, privatePath: /private/blpTokenVault, storagePath: /storage/blpTokenVault), "A.0ae53cb6e3f42a79.FlowToken": A.01cf0e2f2f715450.AssetHandover.FungibleTokenInfo(name: "FLOW", receiverPath: /public/flowTokenReceiver, balancePath: /public/flowTokenBalance, privatePath: /private/flowTokenVault, storagePath: /storage/flowTokenVault)}

# Substitute the value according to your resulting values from above. Note that the address part will be different.
export FLOW_TOKEN_IDENTIFIER=A.0ae53cb6e3f42a79.FlowToken
export BLP_TOKEN_IDENTIFIER=A.01cf0e2f2f715450.BlpToken

# View the available non-fungible tokens.
flow scripts execute ./cadence/scripts/lockUps/getNonFungibleTokenInfoMapping.cdc --network=emulator

# => Output:
Result: {"A.01cf0e2f2f715450.Domains": A.01cf0e2f2f715450.AssetHandover.NonFungibleTokenInfo(name: "Domains", publicPath: /public/flowNameServiceDomains, privatePath: /private/flowNameServiceDomains, storagePath: /storage/flowNameServiceDomains, publicType: Type<&A.01cf0e2f2f715450.Domains.Collection{A.f8d6e0586b0a20c7.NonFungibleToken.CollectionPublic,A.f8d6e0586b0a20c7.NonFungibleToken.Receiver,A.01cf0e2f2f715450.Domains.CollectionPublic,A.f8d6e0586b0a20c7.MetadataViews.ResolverCollection}>(), privateType: Type<&A.01cf0e2f2f715450.Domains.Collection>())}

# Substitute the value according to your resulting values from above. Note that the address part will be different.
export DOMAINS_IDENTIFIER=A.01cf0e2f2f715450.Domains
```

After this setup, the `AssetHandover` smart contract is able to handle two fungible tokens, `FlowToken` & `BlpToken` and one non-fungible token, `Domains`.

### 3. Setup and mint BLP tokens

We use the admin account to setup and mint some BLP tokens.

```bash
# Create the BlpToken.Minter resource.
flow transactions send ./cadence/transactions/blp/createTokenMinter.cdc 20000.0 --network=emulator --signer=handover-admin

# Mint BLP tokens and deposit them to the admin account.
flow transactions send ./cadence/transactions/blp/mintTokens.cdc 15000.0 --network=emulator --signer=handover-admin

# View BLP balance of admin account.
flow scripts execute ./cadence/scripts/blp/getAccountBalance.cdc $ADMIN_ADDRESS --network=emulator

# => Output:
Result: 15000.00000000
```

We have successfully minted `15.000` BLP tokens, and deposited them to the admin account.

### 4. Send BLP tokens to another account

For this step we need to create another emulator account and make our first transfer of BLP tokens. With the admin account, we will transfer some tokens to another regular account, which we will use as the `holder` of the `AssetHandover.LockUp` resource.

```bash
flow keys generate --output=json > holder-account.json

cat holder-account.json

# Substitute $key with the 'public' key from holder-account.json file.
flow accounts create --key $key

# Substitute with the resulting account address.
export HOLDER_ADDRESS=0x179b6b1cb6755e31
```

The `flow.json` file should look something like this now:

```bash
"accounts": {
    "emulator-account": {...},
    "handover-admin": {...},
    "holder": {
        "address": "${address}",
        "key": "${privateKey}"
    }
}
```

With our 2nd account ready, we can make our first transfer of BLP tokens.

```bash
# Create a BlpToken.Vault resource for the holder account.
flow transactions send ./cadence/transactions/blp/createTokenVault.cdc --network=emulator --signer=holder

# Transfer BLP tokens from admin account to holder.
flow transactions send ./cadence/transactions/blp/transferTokens.cdc $HOLDER_ADDRESS 3000.0 --network=emulator --signer=handover-admin

# View BLP balance of holder account.
flow scripts execute ./cadence/scripts/blp/getAccountBalance.cdc $HOLDER_ADDRESS --network=emulator

# => Output:
Result: 3000.00000000

# View the FungibleTokenMetadataViews.FTDisplay for a BlpToken.Vault resource
flow scripts execute ./cadence/scripts/blp/getDisplayView.cdc $HOLDER_ADDRESS

# => Output:
Result: A.01cf0e2f2f715450.FungibleTokenMetadataViews.FTDisplay(name: "Blp Fungible Token", symbol: "BLP", description: "This fungible token is used as an example to help you develop your next FT #onFlow.", externalURL: A.f8d6e0586b0a20c7.MetadataViews.ExternalURL(url: "https://blp-ft.onflow.org"), logos: A.f8d6e0586b0a20c7.MetadataViews.Medias(items: [A.f8d6e0586b0a20c7.MetadataViews.Media(file: A.f8d6e0586b0a20c7.MetadataViews.HTTPFile(url: "https://assets.website-files.com/5f6294c0c7a8cdd643b1c820/5f6294c0c7a8cda55cb1c936_Flow_Wordmark.svg"), mediaType: "image/svg+xml")]), socials: {"twitter": A.f8d6e0586b0a20c7.MetadataViews.ExternalURL(url: "https://twitter.com/flow_blockchain")})
```

### 5. Setup the `Domains` NFT smart contract

We use the admin account to setup our custom `NFT` smart contract.

```bash
# This transaction will set the rental prices for domain names.
flow transactions send ./cadence/transactions/domains/setDomainRentalPrices.cdc --network=emulator --signer=handover-admin
```

### 6. Register a domain to mint an `NFT`

Now, we will use the 2nd account we created, the `holder`, to register a domain and retrieve an `NFT`.

```bash
# Create the Domains.Collection resource on the holder account.
flow transactions send ./cadence/transactions/domains/createAccountCollection.cdc --network=emulator --signer=holder

# Transfer some FLOW tokens to the holder account.
flow transactions send ./cadence/transactions/flow/transferFlowTokens.cdc $HOLDER_ADDRESS 1000.0 --network=emulator --signer=emulator-account

# Mint a Domains.NFT resource and send it to the holder account.
flow transactions send ./cadence/transactions/domains/registerDomain.cdc build-squad 31536000.0 --network=emulator --signer=holder

# The holder can now make changes to this Domains.NFT resource.
flow transactions send ./cadence/transactions/domains/setDomainBioAndAddress.cdc $HOLDER_ADDRESS 'We are BuildSquad. #Web3 enthusiasts and builders!' 0 --network=emulator --signer=holder

# View the Domains.Collection of the holder.
flow scripts execute ./cadence/scripts/domains/getAccountCollection.cdc $HOLDER_ADDRESS --network=emulator

# => Output:
Result: [A.01cf0e2f2f715450.Domains.DomainInfo(id: 0, owner: 0x179b6b1cb6755e31, name: "build-squad.fns", nameHash: "c9174dddcaf26c643d6a8b4e061cb7b4f30de8034da787d2fb1b29b89f48262e", expiresAt: 1704971576.00000000, address: 0x179b6b1cb6755e31, bio: "We are BuildSquad. #Web3 enthusiasts and builders!", createdAt: 1673435576.00000000)]

# View the MetadataViews.Display for a Domains.NFT resource
flow scripts execute ./cadence/scripts/domains/getDisplayView.cdc $HOLDER_ADDRESS 0

# => Output:
Result: s.969ec91403dfa55913205b13d650f1d6ee6a29c267cd5fbae5061a850fe21e45.DomainNFT(name: "build-squad", description: "We are BuildSquad. #Web3 enthusiasts and builders!", thumbnail: "https://www.flow-domains.com/c9174dddcaf26c643d6a8b4e061cb7b4f30de8034da787d2fb1b29b89f48262e", owner: 0x179b6b1cb6755e31, type: Type<A.01cf0e2f2f715450.Domains.NFT>())
```

### 7. Create your first `AssetHandover.LockUp` resource

For this step we need to create another emulator account, the `recipient`, which will be the authorized recipient of the tokens owned by the `holder` account.

```bash
flow keys generate --output=json > recipient-account.json

cat recipient-account.json

# Substitute $key with the 'public' key from recipient-account.json file.
flow accounts create --key $key

# Substitute with the resulting account address.
export RECIPIENT_ADDRESS=0xf3fcd2c1a78f5eee
```

The `flow.json` file should like something like this now:

```bash
"accounts": {
    "emulator-account": {...},
    "handover-admin": {...},
    "holder": {...},
    "recipient": {
        "address": "${address}",
        "key": "${privateKey}"
    }
}
```

Let's proceed with the `AssetHandover.LockUp` resource creation:

```bash
# Create a AssetHandover.LockUp resource for the holder account.
flow transactions send ./cadence/transactions/lockUps/createLockUp.cdc 1700034523 $RECIPIENT_ADDRESS "first backup" "Its going to be used for all of my assets" --network=emulator --signer=holder

# View the public info of the holder's AssetHandover.LockUp resource.
flow scripts execute ./cadence/scripts/lockUps/getAccountLockUp.cdc $HOLDER_ADDRESS --network=emulator

# => Output:
Result: A.01cf0e2f2f715450.AssetHandover.LockUpInfo(holder: 0x179b6b1cb6755e31, releasedAt: 1700034523.00000000, recipient: 0xf3fcd2c1a78f5eee, fungibleTokens: [], nonFungibleTokens: [])
```

### 8. Lock your fungible tokens

The `AssetHandover.LockUp` resource that was just created by the `holder` account, does not have any tokens specified for handover. Let's see how to achieve this, with fungible tokens:

```bash
# With this transaction, we specify the tokens from which fungible token smart contract we want to handover.
flow transactions send ./cadence/transactions/lockUps/lockFungibleToken.cdc $FLOW_TOKEN_IDENTIFIER --network=emulator --signer=holder

# For fungible tokens, we can optionally specify a maximum withdrawal amount, here being 450.0 FLOW tokens.
flow transactions send ./cadence/transactions/lockUps/setLockUpBalance.cdc $FLOW_TOKEN_IDENTIFIER 450.0 --network=emulator --signer=holder

# Likewise, we specify that we want to handover our BLP tokens, without any withdrawl restriction.
flow transactions send ./cadence/transactions/lockUps/lockFungibleToken.cdc $BLP_TOKEN_IDENTIFIER --network=emulator --signer=holder

# With this script, we can view the updated public info of the AssetHandover.LockUp resource.
flow scripts execute ./cadence/scripts/lockUps/getAccountLockUp.cdc $HOLDER_ADDRESS --network=emulator

# => Output:
Result: A.01cf0e2f2f715450.AssetHandover.LockUpInfo(holder: 0x179b6b1cb6755e31, releasedAt: 1700034523.00000000, recipient: 0xf3fcd2c1a78f5eee, fungibleTokens: [A.01cf0e2f2f715450.AssetHandover.FTLockUpInfo(identifier: "A.0ae53cb6e3f42a79.FlowToken", balance: 450.00000000), A.01cf0e2f2f715450.AssetHandover.FTLockUpInfo(identifier: "A.01cf0e2f2f715450.BlpToken", balance: nil)], nonFungibleTokens: [])
```

### 8. Lock your NFTs

Likewise, the `holder` account can specify which NFTs will be put for handover.

```bash
# With this transaction, we specify the tokens from which NFT smart contract we want to handover.
flow transactions send ./cadence/transactions/lockUps/lockNonFungibleToken.cdc $DOMAINS_IDENTIFIER --network=emulator --signer=holder

# Let's view the updated public info of the AssetHandover.LockUp resource.
flow scripts execute ./cadence/scripts/lockUps/getAccountLockUp.cdc $HOLDER_ADDRESS --network=emulator

# => Output:
Result: A.01cf0e2f2f715450.AssetHandover.LockUpInfo(holder: 0x179b6b1cb6755e31, releasedAt: 1700034523.00000000, recipient: 0xf3fcd2c1a78f5eee, fungibleTokens: [A.01cf0e2f2f715450.AssetHandover.FTLockUpInfo(identifier: "A.0ae53cb6e3f42a79.FlowToken", balance: 450.00000000), A.01cf0e2f2f715450.AssetHandover.FTLockUpInfo(identifier: "A.01cf0e2f2f715450.BlpToken", balance: nil)], nonFungibleTokens: [A.01cf0e2f2f715450.AssetHandover.NFTLockUpInfo(identifier: "A.01cf0e2f2f715450.Domains", nftIDs: [])])
```

### 9. Recipient account withdraws the NFTs from the LockUp

With the `AssetHandover.LockUp` resource in place, let's see how the `recipient` account can withdraw the NFTs from the `holder` account.

```bash
# Send some FLOW tokens to the recipient account.
flow transactions send ./cadence/transactions/flow/transferFlowTokens.cdc $RECIPIENT_ADDRESS 1000.0 --network=emulator --signer=emulator-account

# Viewing the AssetHandover.LockUp public info, the recipient can specify which NFTs to withdraw.
flow transactions send ./cadence/transactions/lockUps/withdrawNonFungibleToken.cdc $DOMAINS_IDENTIFIER $HOLDER_ADDRESS --network=emulator --signer=recipient

# => Output: It turns out that the recipient account cannot hold NFTs from the Domains smart contract, without a Domains.Collection resource in the account storage.
error: panic("You do not own such an NFT Collection.")

# With this NodeJS script, we properly setup the recipient account.
node cadence/transactions/lockUps/initCollection.js $DOMAINS_IDENTIFIER recipient

# Second attempt at withdrawing the Domains NFTs
flow transactions send ./cadence/transactions/lockUps/withdrawNonFungibleToken.cdc $DOMAINS_IDENTIFIER $HOLDER_ADDRESS --network=emulator --signer=recipient

# => Output: The value of  the `releasedAt` field is a Unix timestamp which points to a future date, hence we cannot withdraw yet.
error: panic: The assets are still in lock-up period!

# For the sake of testing, we use the holder account to change the `releasedAt` value to a past date.
flow transactions send ./cadence/transactions/lockUps/setLockUpReleasedAt.cdc 1663224523 --network=emulator --signer=holder

# Recipient attempts to withdraw the NFTs again.
flow transactions send ./cadence/transactions/lockUps/withdrawNonFungibleToken.cdc $DOMAINS_IDENTIFIER $HOLDER_ADDRESS --network=emulator --signer=recipient

# We check the Domains.Collection of the recipient, and we see the only NFT that was previously owned by the holder.
flow scripts execute ./cadence/scripts/domains/getAccountCollection.cdc $RECIPIENT_ADDRESS --network=emulator

# => Output:
Result: [A.01cf0e2f2f715450.Domains.DomainInfo(id: 0, owner: 0xf3fcd2c1a78f5eee, name: "build-squad.fns", nameHash: "c9174dddcaf26c643d6a8b4e061cb7b4f30de8034da787d2fb1b29b89f48262e", expiresAt: 1704971576.00000000, address: 0x179b6b1cb6755e31, bio: "We are BuildSquad. #Web3 enthusiasts and builders!", createdAt: 1673435576.00000000)]
```

We managed to successfully create a `Domains.Collection` resource for the `recipient`, and to withdraw an `NFT` from the `holder`.

This implies that the `Domains.Collection` resource of the `holder` should now be empty. We can verify this ourselves:

```bash
# Viewing the holder's Domains.Collection
flow scripts execute ./cadence/scripts/domains/getAccountCollection.cdc $HOLDER_ADDRESS --network=emulator

# => Output:
Result: []
```

### 10. Recipient account withdraws the fungible tokens from the LockUp

Likewise, the `recipient` account can withdraw the fungible tokens from the `holder` account.

Let's begin with the `FlowToken`.

```bash
# The recipient attempts to withdraw the FLOW tokens.
flow transactions send ./cadence/transactions/lockUps/withdrawFungibleToken.cdc $FLOW_TOKEN_IDENTIFIER $HOLDER_ADDRESS 550.0 --network=emulator --signer=recipient

# => Output:
error:panic("Could not borrow FungibleTokenSwitchboard.Switchboard reference.")
```

Because we want to achieve interoperability between implementations of the `FungibleToken` smart contract interface, we make use of the [FungibleTokenSwitchboard](https://github.com/onflow/flow-ft#fungible-token-switchboard) smart contract. It allows users to receive payments in different fungible tokens using a single `&{FungibleToken.Receiver}` capability, and it's fun to experiment with.

```bash
# We create the FungibleTokenSwitchboard.Switchboard resource for the recipient account.
flow transactions send ./cadence/transactions/fungibleTokenSwitchboard/setupAccount.cdc --network=emulator --signer=recipient

# The recipient makes an attempt to withdraw some amount of FLOW tokens.
flow transactions send ./cadence/transactions/lockUps/withdrawFungibleToken.cdc $FLOW_TOKEN_IDENTIFIER $HOLDER_ADDRESS 550.0 --network=emulator --signer=recipient

# => Output: Remember that we specified a maximum withdrawal amount of 450 FLOW tokens, so this naturally fails.
error: panic: You cannot withdraw more than the remaining balance of: 450.00000000

# The recipient attempts to withdraw a smaller amount.
flow transactions send ./cadence/transactions/lockUps/withdrawFungibleToken.cdc $FLOW_TOKEN_IDENTIFIER $HOLDER_ADDRESS 250.0 --network=emulator --signer=recipient

# => Output: This also fails, because the recipient has not yet made the FlowToken.Vault available on the Switchboard.
error: panic: The deposited vault is not available on this switchboard

# This NodeJS script will properly setup the switchboard for the FlowToken.Vault resource.
node cadence/transactions/fungibleTokenSwitchboard/addVaultCapability.js $FLOW_TOKEN_IDENTIFIER recipient

# Yet another attempt to withdraw 250 FLOW tokens.
flow transactions send ./cadence/transactions/lockUps/withdrawFungibleToken.cdc $FLOW_TOKEN_IDENTIFIER $HOLDER_ADDRESS 250.0 --network=emulator --signer=recipient

# We check to see the recipient's FLOW balance.
flow scripts execute ./cadence/scripts/flow/getAccountBalance.cdc $RECIPIENT_ADDRESS --network=emulator

# => Output: The withdrawal has been successfull. However, we charge 5 FLOW tokens for the AssetHandover.LockUp resource creation (the holder), and we also chanrge the recipient 2 FLOW tokens for each withdrawal. 4 FLOW tokens were charged for withdrawing the Domains NFTs and the FlowToken. That is the reason we get 1246.0, instead of 1250.0 .
Result: 1246.00000000

# Recipient attempts to withdraw another 250 FLOW tokens.
flow transactions send ./cadence/transactions/lockUps/withdrawFungibleToken.cdc $FLOW_TOKEN_IDENTIFIER $HOLDER_ADDRESS 250.0 --network=emulator --signer=recipient

# => Output: A friendly error message showing that from the initial maximum withdrawl amount of 450 FLOW tokens, only 200 are left.
error: panic: You cannot withdraw more than the remaining balance of: 200.00000000
```

Moving on, let's withdraw the `BlpToken`.

```bash
# Recipient attempts to withdraw 500 BLP tokens.
flow transactions send ./cadence/transactions/lockUps/withdrawFungibleToken.cdc $BLP_TOKEN_IDENTIFIER $HOLDER_ADDRESS 500.0 --network=emulator --signer=recipient

# => Output: The recipient's FungibleTokenSwitchboard does not yet handle deposits of the BLP FungibleToken. It is up to the recipient to decide whether to enable such deposits or not.
error: panic: The deposited vault is not available on this switchboard

# Assuming the recipient's consent, this NodeJS script will properly setup the switchboard for the BlpToken.Vault resource.
node cadence/transactions/fungibleTokenSwitchboard/addVaultCapability.js $BLP_TOKEN_IDENTIFIER recipient

# The recipient attempts again to withdraw 500 BLP tokens.
flow transactions send ./cadence/transactions/lockUps/withdrawFungibleToken.cdc $BLP_TOKEN_IDENTIFIER $HOLDER_ADDRESS 500.0 --network=emulator --signer=recipient

# We view the recipient's BLP balance.
flow scripts execute ./cadence/scripts/blp/getAccountBalance.cdc $RECIPIENT_ADDRESS --network=emulator

# => Output:
Result: 500.00000000

# Since for this BlpToken there is no maximum withdrawal amount, the recipient can withdraw again, until the holder's balance runs out. For each withdraw, the recipient will be charged 2 FLOW tokens.
flow transactions send ./cadence/transactions/lockUps/withdrawFungibleToken.cdc $BLP_TOKEN_IDENTIFIER $HOLDER_ADDRESS 300.0 --network=emulator --signer=recipient

# We view again the recipients BLP balance.
flow scripts execute ./cadence/scripts/blp/getAccountBalance.cdc $RECIPIENT_ADDRESS --network=emulator

# => Output:
Result: 800.00000000
```

With that we have completed the happy path scenario, in which a `holder` creates a `AssetHandover.LockUp` resource and the `recipient` successfully withdraws the containing tokens/assets.

### 11. View address info mapping of all the assigned LockUp resources

We can use the script below, to check if a given address is entitled as the recipient of a `AssetHandover.LockUp`.

```bash
# This script will return a mapping with the available AssetHandover.LockUp resources. The key is the recipient address, and the value is an Array of addresses which have created a LockUp for this recipient.
flow scripts execute ./cadence/scripts/lockUps/getLockUpsMapping.cdc --network=emulator

# => Output:
Result: {0xf3fcd2c1a78f5eee: [0x179b6b1cb6755e31]}
```

Using the address contained in the key of the dictionary above, we can view the public `AssetHandover.LockUpInfo` of the resource.

```bash
flow scripts execute ./cadence/scripts/lockUps/getLockUpsByRecipient.cdc $RECIPIENT_ADDRESS --network=emulator

# => Output:
Result: [A.01cf0e2f2f715450.AssetHandover.LockUpInfo(holder: 0x179b6b1cb6755e31, releasedAt: 1663224523.00000000, recipient: 0xf3fcd2c1a78f5eee, fungibleTokens: [A.01cf0e2f2f715450.AssetHandover.FTLockUpInfo(identifier: "A.0ae53cb6e3f42a79.FlowToken", balance: 200.00000000), A.01cf0e2f2f715450.AssetHandover.FTLockUpInfo(identifier: "A.01cf0e2f2f715450.BlpToken", balance: nil)], nonFungibleTokens: [A.01cf0e2f2f715450.AssetHandover.NFTLockUpInfo(identifier: "A.01cf0e2f2f715450.Domains", nftIDs: [])])]
```

### 12. View and update creation/withdraw fees

As we mentioned above, there is a fee for `AssetHandover.LockUp` creation, as well as for each withdrawal. This is mainly for demonstration purposes, to showcase how one can monetize certain features of their dapp on Flow.

```bash
# This script will return the fees for creating a LockUp.
flow scripts execute ./cadence/scripts/lockUps/getCreationFees.cdc --network=emulator

# => Output:
Result: 5.00000000
```

```bash
# This script will return the fees for withdrawing from a LockUp.
flow scripts execute ./cadence/scripts/lockUps/getWithdrawFees.cdc --network=emulator

# => Output:
Result: 2.00000000
```

```bash
# The Admin account is able to change the LockUp creation fees.
flow transactions send ./cadence/transactions/lockUps/updateCreationFees.cdc 0.05 --network=emulator --signer=handover-admin

flow scripts execute ./cadence/scripts/lockUps/getCreationFees.cdc --network=emulator

# => Output:
Result: 0.05000000
```

```bash
# The Admin account is able to change the LockUp withdraw fees.
flow transactions send ./cadence/transactions/lockUps/updateWithdrawFees.cdc 0.02 --network=emulator --signer=handover-admin

flow scripts execute ./cadence/scripts/lockUps/getWithdrawFees.cdc --network=emulator

# => Output:
Result: 0.02000000
```

### 13. Add the `FUSD` FungibleToken

Now, let's see how the Admin account can add an existing `FungibleToken` implementation, namely the `FUSD`.

```bash
# This transaction will add the necessary info of the `FUSD` smart contract, to our registry of supported tokens for handovers.
flow transactions send ./cadence/transactions/lockUps/addFUSDTokenInfo.cdc --network=emulator --signer=handover-admin

# We view the updated info mapping for fungible tokens.
flow scripts execute ./cadence/scripts/lockUps/getFungibleTokenInfoMapping.cdc --network=emulator

# => Output:
Result: {"A.01cf0e2f2f715450.BlpToken": A.01cf0e2f2f715450.AssetHandover.FungibleTokenInfo(name: "BLP", receiverPath: /public/blpTokenReceiver, balancePath: /public/blpTokenMetadata, privatePath: /private/blpTokenVault, storagePath: /storage/blpTokenVault), "A.0ae53cb6e3f42a79.FlowToken": A.01cf0e2f2f715450.AssetHandover.FungibleTokenInfo(name: "FLOW", receiverPath: /public/flowTokenReceiver, balancePath: /public/flowTokenBalance, privatePath: /private/flowTokenVault, storagePath: /storage/flowTokenVault), "A.f8d6e0586b0a20c7.FUSD": A.01cf0e2f2f715450.AssetHandover.FungibleTokenInfo(name: "FUSD", receiverPath: /public/fusdReceiver, balancePath: /public/fusdBalance, privatePath: /private/fusdVault, storagePath: /storage/fusdVault)}

export FUSD_TOKEN_IDENTIFIER=A.f8d6e0586b0a20c7.FUSD
```

Users of our dapp, would now be able to also handover `FUSD` tokens. Let's see how we can achieve that with the `holder` account.

```bash
# Let's see the FUSD balance of the holder account.
flow scripts execute ./cadence/scripts/fusd/getAccountBalance.cdc $HOLDER_ADDRESS --network=emulator

# => Output: The holder account does not have such a vault.
panic("Could not borrow Balance reference to the Vault")
```

Let's create this `FUSD.Vault` with the info we just added in our registry. These look like:

```cadence
var fungibleTokenInfo = AssetHandover.FungibleTokenInfo(
    name: "FUSD",
    receiverPath: /public/fusdReceiver,
    balancePath: /public/fusdBalance,
    privatePath: /private/fusdVault,
    storagePath: /storage/fusdVault
)
```

```bash
# We setup the account with a FungibleTokenSwitchboard as well.
flow transactions send ./cadence/transactions/fungibleTokenSwitchboard/setupAccount.cdc --network=emulator --signer=holder

# This NodeJS script will generate a transaction for setting up the FUSD.Vault for the holder.
node cadence/transactions/fungibleTokenSwitchboard/addVaultCapability.js $FUSD_TOKEN_IDENTIFIER holder

# We can now view the balance of the newly-created FUSD.Vault.
flow scripts execute ./cadence/scripts/fusd/getAccountBalance.cdc $HOLDER_ADDRESS --network=emulator

# => Output: The FUSD.Vault was properly created, with the necessary public capabilities.
Result: 0.00000000
```

```bash
# The holder specifies that FUSD tokens should be included in the handover.
flow transactions send ./cadence/transactions/lockUps/lockFungibleToken.cdc $FUSD_TOKEN_IDENTIFIER --network=emulator --signer=holder

# Let's view the updated public info of the AssetHandover.LockUp resource
flow scripts execute ./cadence/scripts/lockUps/getAccountLockUp.cdc $HOLDER_ADDRESS --network=emulator

# => Output: The Array of fungibleTokens, now contains FUSD also, however the account does not own any such tokes at the moment. In the future, this could change, and the authorized recipient could withdraw them.
Result: A.01cf0e2f2f715450.AssetHandover.LockUpInfo(holder: 0x179b6b1cb6755e31, releasedAt: 1663224523.00000000, recipient: 0xf3fcd2c1a78f5eee, fungibleTokens: [A.01cf0e2f2f715450.AssetHandover.FTLockUpInfo(identifier: "A.f8d6e0586b0a20c7.FUSD", balance: nil), A.01cf0e2f2f715450.AssetHandover.FTLockUpInfo(identifier: "A.0ae53cb6e3f42a79.FlowToken", balance: 200.00000000), A.01cf0e2f2f715450.AssetHandover.FTLockUpInfo(identifier: "A.01cf0e2f2f715450.BlpToken", balance: nil)], nonFungibleTokens: [A.01cf0e2f2f715450.AssetHandover.NFTLockUpInfo(identifier: "A.01cf0e2f2f715450.Domains", nftIDs: [])])
```

Without having to make changes to the `AssetHandover` smart contract and re-deploy, we were able to support a new `FungibleToken` and properly initialize a `FUSD.Vault` for the `holder` account. We can achieve the same functionality with smart contracts implementing the `NonFungibleToken` smart contract interface.

Let's see how to play with the `FUSD` fungible token, provided by the emulator:

```bash
# First we create a FUSD.MinterProxy resource.
flow transactions send ./cadence/transactions/fusd/minter/setupMinter.cdc --network=emulator --signer=emulator-account

# We deposit the FUSD.MinterProxy resource to the emulator-account.
flow transactions send ./cadence/transactions/fusd/admin/depositMinter.cdc --network=emulator 0xf8d6e0586b0a20c7 --signer=emulator-account

# Finally we mint 1000 FUSD tokens and transfer them to holder account.
flow transactions send ./cadence/transactions/fusd/minter/mintTokens.cdc 1000.0 $HOLDER_ADDRESS --network=emulator --signer=emulator-account

# We can now view the balance of the newly-created FUSD.Vault, for the holder account.
flow scripts execute ./cadence/scripts/fusd/getAccountBalance.cdc $HOLDER_ADDRESS --network=emulator

# Output: =>
Result: 1000.00000000
```

Now that the `holder` account holds some `FUSD` tokens, the `recipient` can withdraw them.

```bash
# Recipient attempts to withdraw FUSD tokens.
flow transactions send ./cadence/transactions/lockUps/withdrawFungibleToken.cdc $FUSD_TOKEN_IDENTIFIER $HOLDER_ADDRESS 800.0 --network=emulator --signer=recipient

# => Output: The recipient's FungibleTokenSwitchboard does not yet handle deposits of the FUSD FungibleToken. It is up to the recipient to decide whether to enable such deposits or not.
error: panic: The deposited vault is not available on this switchboard

# Assuming the recipient's consent, this NodeJS script will properly setup the switchboard for the FUSD.Vault resource.
node cadence/transactions/fungibleTokenSwitchboard/addVaultCapability.js $FUSD_TOKEN_IDENTIFIER recipient

# Recipient attempts to withdraw FUSD tokens.
flow transactions send ./cadence/transactions/lockUps/withdrawFungibleToken.cdc $FUSD_TOKEN_IDENTIFIER $HOLDER_ADDRESS 800.0 --network=emulator --signer=recipient

# Verifying that the recipient was able to withdraw the FUSD tokens.
flow scripts execute ./cadence/scripts/fusd/getAccountBalance.cdc $RECIPIENT_ADDRESS --network=emulator

# Output: =>
Result: 800.00000000
```

### 14. Add the `ExampleNFT` NonFungibleToken

Let's see how can we do that for the [ExampleNFT](https://github.com/dapperlabs/nft-catalog/blob/main/cadence/contracts/ExampleNFT.cdc) NFT smart contract.

We begin by setting up the `holder` account with a `ExampleNFT` collection.

```bash
# We setup the collection for the holder account.
flow transactions send ./cadence/transactions/exampleNFT/setupCollection.cdc --network=emulator --signer=holder

# Let's see the ExampleNFT Collection of the holder account.
flow scripts execute ./cadence/scripts/exampleNFT/getNFTids.cdc $HOLDER_ADDRESS --network=emulator

# Output: =>
Result: []
```

```bash
# We add the necessary info for the ExampleNFT smart contract. Namely storage paths and linked types.
flow transactions send ./cadence/transactions/lockUps/addExampleNFTTokenInfo.cdc --network=emulator --signer=handover-admin

# Now we can view the newly-added smart contract that is supported by AssetHandover.
flow scripts execute ./cadence/scripts/lockUps/getNonFungibleTokenInfoMapping.cdc --network=emulator

# => Output:
Result: {"A.01cf0e2f2f715450.Domains": A.01cf0e2f2f715450.AssetHandover.NonFungibleTokenInfo(name: "Domains", publicPath: /public/flowNameServiceDomains, privatePath: /private/flowNameServiceDomains, storagePath: /storage/flowNameServiceDomains, publicType: Type<&A.01cf0e2f2f715450.Domains.Collection{A.f8d6e0586b0a20c7.NonFungibleToken.CollectionPublic,A.f8d6e0586b0a20c7.NonFungibleToken.Receiver,A.01cf0e2f2f715450.Domains.CollectionPublic,A.f8d6e0586b0a20c7.MetadataViews.ResolverCollection}>(), privateType: Type<&A.01cf0e2f2f715450.Domains.Collection>()), "A.f8d6e0586b0a20c7.ExampleNFT": A.01cf0e2f2f715450.AssetHandover.NonFungibleTokenInfo(name: "ExampleNFT", publicPath: /public/exampleNFTCollection, privatePath: /private/exampleNFTCollection, storagePath: /storage/exampleNFTCollection, publicType: Type<&A.f8d6e0586b0a20c7.ExampleNFT.Collection{A.f8d6e0586b0a20c7.ExampleNFT.ExampleNFTCollectionPublic,A.f8d6e0586b0a20c7.NonFungibleToken.CollectionPublic,A.f8d6e0586b0a20c7.NonFungibleToken.Receiver,A.f8d6e0586b0a20c7.MetadataViews.ResolverCollection}>(), privateType: Type<&A.f8d6e0586b0a20c7.ExampleNFT.Collection>())}

export EXAMPLE_NFT_IDENTIFIER=A.f8d6e0586b0a20c7.ExampleNFT
```

```bash
# We specify that tokens of the ExampleNFT Collection, will also be handed over.
flow transactions send ./cadence/transactions/lockUps/lockNonFungibleToken.cdc $EXAMPLE_NFT_IDENTIFIER --network=emulator --signer=holder

# Let's view the updated public info of the AssetHandover.LockUp resource
flow scripts execute ./cadence/scripts/lockUps/getAccountLockUp.cdc $HOLDER_ADDRESS --network=emulator

# => Output: The Array of nonFungibleTokens, now also contains "A.f8d6e0586b0a20c7.ExampleNFT".
Result: A.01cf0e2f2f715450.AssetHandover.LockUpInfo(holder: 0x179b6b1cb6755e31, releasedAt: 1663224523.00000000, recipient: 0xf3fcd2c1a78f5eee, fungibleTokens: [A.01cf0e2f2f715450.AssetHandover.FTLockUpInfo(identifier: "A.f8d6e0586b0a20c7.FUSD", balance: nil), A.01cf0e2f2f715450.AssetHandover.FTLockUpInfo(identifier: "A.0ae53cb6e3f42a79.FlowToken", balance: 200.00000000), A.01cf0e2f2f715450.AssetHandover.FTLockUpInfo(identifier: "A.01cf0e2f2f715450.BlpToken", balance: nil)], nonFungibleTokens: [A.01cf0e2f2f715450.AssetHandover.NFTLockUpInfo(identifier: "A.f8d6e0586b0a20c7.ExampleNFT", nftIDs: []), A.01cf0e2f2f715450.AssetHandover.NFTLockUpInfo(identifier: "A.01cf0e2f2f715450.Domains", nftIDs: [])])
```

By adding the necessary info of the `ExampleNFT` NFT smart contract, we were able to support it in our `AssetHandover` contract, without having to re-deploy. The info that was needed are:

```cadence
var nonFungibleTokenInfo = AssetHandover.NonFungibleTokenInfo(
    name: "ExampleNFT",
    publicPath: ExampleNFT.CollectionPublicPath,
    privatePath: /private/exampleNFTCollection,
    storagePath: ExampleNFT.CollectionStoragePath,
    publicType: Type<&ExampleNFT.Collection{ExampleNFT.ExampleNFTCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Receiver,MetadataViews.ResolverCollection}>(),
    privateType: Type<&ExampleNFT.Collection>()
)
```

Now let's mint some `ExampleNFT` tokens, and play with the contract provided by the emulator:

```bash
# Setting up minting account for receiving royalties.
flow transactions send ./cadence/transactions/exampleNFT/setupAccountToReceiveRoyalty.cdc '/storage/flowTokenVault' --network=emulator --signer=emulator-account

# Mint an ExampleNFT token and transfer it to holder account.
flow transactions send ./cadence/transactions/exampleNFT/mintNFT.cdc $HOLDER_ADDRESS 'My Example NFT' 'My Example NFT Description' 'https://www.example-nft.com/thumbnails/0' '[0.05]' '["Tribute to Creator!"]' '[0xf8d6e0586b0a20c7]' --network=emulator --signer=emulator-account

# Let's see the ExampleNFT Collection of the holder account.
flow scripts execute ./cadence/scripts/exampleNFT/getNFTids.cdc $HOLDER_ADDRESS --network=emulator

# Output: =>
Result: [0]

# Recipient account can now withdraw ExampleNFT tokens from holder account.
flow transactions send ./cadence/transactions/lockUps/withdrawNonFungibleToken.cdc $EXAMPLE_NFT_IDENTIFIER $HOLDER_ADDRESS --network=emulator --signer=recipient

# => Output: The recipient account is not set up to receive such NFTs.
error: panic: You do not own such an NFT Collection.

# We properly set up the recipient account with the necessary ExampleNFT collection.
node cadence/transactions/lockUps/initCollection.js $EXAMPLE_NFT_IDENTIFIER recipient

# Recipient attempts again to withdraw ExampleNFT tokens.
flow transactions send ./cadence/transactions/lockUps/withdrawNonFungibleToken.cdc $EXAMPLE_NFT_IDENTIFIER $HOLDER_ADDRESS --network=emulator --signer=recipient

# The withdrwawl should have been successful.
flow scripts execute ./cadence/scripts/exampleNFT/getNFTids.cdc $RECIPIENT_ADDRESS --network=emulator

# Output: =>
Result: [0]

# The ExampleNFT token was withdrawed from the holder account.
flow scripts execute ./cadence/scripts/exampleNFT/getNFTids.cdc $HOLDER_ADDRESS --network=emulator

# Output: =>
Result: []
```

Again, without having to make changes to the `AssetHandover` smart contract and re-deploy, we were able to support a new `NonFungibleToken` and properly initialize a `ExampleNFT.Collection` resource for the `holder` account. We can achieve the same functionality with smart contracts implementing the `NonFungibleToken` smart contract interface.

All of these can be found in the Github repository.
