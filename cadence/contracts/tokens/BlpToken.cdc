import FungibleToken from "../interfaces/FungibleToken.cdc"
import MetadataViews from "../utility/MetadataViews.cdc"
import FungibleTokenMetadataViews from "../utility/FungibleTokenMetadataViews.cdc"

pub contract BlpToken: FungibleToken {
    pub let adminPath: StoragePath
    pub let minterPath: StoragePath
    pub let storagePath: StoragePath
    pub let providerPath: PrivatePath
    pub let receiverPath: PublicPath
    pub let metadataPath: PublicPath

    pub var totalSupply: UFix64

    pub event TokensInitialized(initialSupply: UFix64)

    pub event TokensWithdrawn(amount: UFix64, from: Address?)

    pub event TokensDeposited(amount: UFix64, to: Address?)

    pub event TokensMinted(amount: UFix64)

    pub event TokensBurned(amount: UFix64)

    pub event MinterCreated(allowedAmount: UFix64)

    pub event BurnerCreated()

    pub resource Vault: FungibleToken.Provider, FungibleToken.Receiver, FungibleToken.Balance, MetadataViews.Resolver {
        pub var balance: UFix64

        init(balance: UFix64) {
            self.balance = balance
        }

        pub fun withdraw(amount: UFix64): @FungibleToken.Vault {
            self.balance = self.balance - amount
            emit TokensWithdrawn(amount: amount, from: self.owner?.address)
            return <-create Vault(balance: amount)
        }

        pub fun deposit(from: @FungibleToken.Vault) {
            let vault <- from as! @BlpToken.Vault
            self.balance = self.balance + vault.balance
            emit TokensDeposited(amount: vault.balance, to: self.owner?.address)
            vault.balance = 0.0
            destroy vault
        }

        pub fun getViews(): [Type] {
            return [
                Type<FungibleTokenMetadataViews.FTView>(),
                Type<FungibleTokenMetadataViews.FTDisplay>(),
                Type<FungibleTokenMetadataViews.FTVaultData>()
            ]
        }

        pub fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<FungibleTokenMetadataViews.FTView>():
                    return FungibleTokenMetadataViews.FTView(
                        ftDisplay: self.resolveView(Type<FungibleTokenMetadataViews.FTDisplay>()) as! FungibleTokenMetadataViews.FTDisplay?,
                        ftVaultData: self.resolveView(Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
                    )
                case Type<FungibleTokenMetadataViews.FTDisplay>():
                    let media = MetadataViews.Media(
                        file: MetadataViews.HTTPFile(
                            url: "https://assets.website-files.com/5f6294c0c7a8cdd643b1c820/5f6294c0c7a8cda55cb1c936_Flow_Wordmark.svg"
                        ),
                        mediaType: "image/svg+xml"
                    )
                    let medias = MetadataViews.Medias([media])
                    return FungibleTokenMetadataViews.FTDisplay(
                        name: "Blp Fungible Token",
                        symbol: "BLP",
                        description: "This fungible token is used as an example to help you develop your next FT #onFlow.",
                        externalURL: MetadataViews.ExternalURL("https://blp-ft.onflow.org"),
                        logos: medias,
                        socials: {
                            "twitter": MetadataViews.ExternalURL("https://twitter.com/flow_blockchain")
                        }
                    )
                case Type<FungibleTokenMetadataViews.FTVaultData>():
                    return FungibleTokenMetadataViews.FTVaultData(
                        storagePath: BlpToken.storagePath,
                        receiverPath: BlpToken.receiverPath,
                        metadataPath: BlpToken.metadataPath,
                        providerPath: BlpToken.providerPath,
                        receiverLinkedType: Type<&BlpToken.Vault{FungibleToken.Receiver}>(),
                        metadataLinkedType: Type<&BlpToken.Vault{FungibleToken.Balance, MetadataViews.Resolver}>(),
                        providerLinkedType: Type<&BlpToken.Vault{FungibleToken.Provider}>(),
                        createEmptyVaultFunction: (fun (): @FungibleToken.Vault {
                            return <-BlpToken.createEmptyVault()
                        })
                    )
            }

            return nil
        }

        destroy() {
            if self.balance > 0.0 {
                BlpToken.totalSupply = BlpToken.totalSupply - self.balance
            }
        }
    }

    pub fun createEmptyVault(): @FungibleToken.Vault {
        return <-create Vault(balance: 0.0)
    }

    pub resource Administrator {
        pub fun createNewMinter(allowedAmount: UFix64): @Minter {
            emit MinterCreated(allowedAmount: allowedAmount)
            return <-create Minter(allowedAmount: allowedAmount)
        }

        pub fun createNewBurner(): @Burner {
            emit BurnerCreated()
            return <-create Burner()
        }
    }

    pub resource Minter {
        pub var allowedAmount: UFix64

        pub fun mintTokens(amount: UFix64): @BlpToken.Vault {
            pre {
                amount > UFix64(0): "Amount minted must be greater than zero"
                amount <= self.allowedAmount: "Amount minted must be less than the allowed amount"
            }
            BlpToken.totalSupply = BlpToken.totalSupply + amount
            self.allowedAmount = self.allowedAmount - amount
            emit TokensMinted(amount: amount)
            return <-create Vault(balance: amount)
        }

        init(allowedAmount: UFix64) {
            self.allowedAmount = allowedAmount
        }
    }

    pub resource Burner {
        pub fun burnTokens(from: @FungibleToken.Vault) {
            let vault <- from as! @BlpToken.Vault
            let amount = vault.balance
            destroy vault
            emit TokensBurned(amount: amount)
        }
    }

    init() {
        self.adminPath = /storage/blpTokenAdmin
        self.minterPath = /storage/blpTokenMinter
        self.storagePath = /storage/blpTokenVault
        self.providerPath = /private/blpTokenVault
        self.metadataPath = /public/blpTokenMetadata
        self.receiverPath = /public/blpTokenReceiver

        self.totalSupply = 0.0

        let vault <- create Vault(balance: self.totalSupply)
        self.account.save(<-vault, to: self.storagePath)

        self.account.link<&BlpToken.Vault{FungibleToken.Receiver}>(
            self.receiverPath,
            target: self.storagePath
        )

        self.account.link<&BlpToken.Vault{FungibleToken.Balance, MetadataViews.Resolver}>(
            self.metadataPath,
            target: self.storagePath
        )

        let admin <- create Administrator()
        self.account.save(<-admin, to: self.adminPath)

        emit TokensInitialized(initialSupply: self.totalSupply)
    }
}
