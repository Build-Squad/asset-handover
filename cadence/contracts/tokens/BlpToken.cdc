import FungibleToken from "../interfaces/FungibleToken.cdc"

pub contract BlpToken: FungibleToken {
    pub let adminPath: StoragePath
    pub let minterPath: StoragePath
    pub let vaultPath: StoragePath
    pub let balancePath: PublicPath
    pub let receiverPath: PublicPath

    pub let tokenAlias: String

    pub var totalSupply: UFix64

    pub event TokensInitialized(initialSupply: UFix64)

    pub event TokensWithdrawn(amount: UFix64, from: Address?)

    pub event TokensDeposited(amount: UFix64, to: Address?)

    pub event TokensMinted(amount: UFix64)

    pub event TokensBurned(amount: UFix64)

    pub event MinterCreated(allowedAmount: UFix64)

    pub event BurnerCreated()

    pub resource Vault: FungibleToken.Provider, FungibleToken.Receiver, FungibleToken.Balance {
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
        self.vaultPath = /storage/blpTokenVault
        self.balancePath = /public/blpTokenBalance
        self.receiverPath = /public/blpTokenReceiver
        self.tokenAlias = "BLP"
        self.totalSupply = 0.0

        let vault <- create Vault(balance: self.totalSupply)
        self.account.save(<-vault, to: self.vaultPath)

        self.account.link<&BlpToken.Vault{FungibleToken.Balance}>(
            self.balancePath,
            target: self.vaultPath
        )

        self.account.link<&BlpToken.Vault{FungibleToken.Receiver}>(
            self.receiverPath,
            target: self.vaultPath
        )

        let admin <- create Administrator()
        self.account.save(<-admin, to: self.adminPath)

        emit TokensInitialized(initialSupply: self.totalSupply)
    }
}
