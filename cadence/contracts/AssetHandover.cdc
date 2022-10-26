import FungibleToken from "./interfaces/FungibleToken.cdc"
import FlowToken from "./tokens/FlowToken.cdc"

pub contract AssetHandover {
    access(contract) let vaultMappings: {Address: Capability<&FlowToken.Vault>}

    pub let LockUpStoragePath: StoragePath
    pub let LockUpPrivatePath: PrivatePath
    pub let LockUpPublicPath: PublicPath

    pub event LockUpCreated(owner: Address, recipient: Address)
    pub event LockUpDestroyed(owner: Address, recipient: Address)
    pub event LockUpRecipientChanged(owner: Address, recipient: Address)
    pub event LockUpReleasedAtChanged(owner: Address, releasedAt: UFix64)
    pub event LockUpBalanceChanged(owner: Address, balance: UFix64)
    pub event LockUpWithdrawn(owner: Address, recipient: Address, amount: UFix64)
    pub event LockUpBalanceWithdrawn(owner: Address, recipient: Address)

    init() {
        self.vaultMappings = {}

        self.LockUpStoragePath = /storage/AssetHandover
        self.LockUpPrivatePath = /private/AssetHandover
        self.LockUpPublicPath = /public/AssetHandover
    }

    pub struct LockUpInfo {
        pub let owner: Address?
        pub let releasedAt: UFix64
        pub let recipient: Address
        pub let balance: UFix64?

        init(
            owner: Address?,
            releasedAt: UFix64,
            recipient: Address,
            balance: UFix64?
        ) {
            self.owner = owner
            self.releasedAt = releasedAt
            self.recipient = recipient
            self.balance = balance
        }
    }

    pub resource interface LockUpPublic {
        pub fun getInfo(): LockUpInfo
        pub fun withdraw(amount: UFix64, receiver: Capability<&{FungibleToken.Receiver}>)
    }

    pub resource interface LockUpPrivate {
        pub fun setReleasedAt(releasedAt: UFix64)
        pub fun setRecipient(recipient: Address)
        pub fun setBalance(balance: UFix64)
    }

    pub resource LockUp: LockUpPublic, LockUpPrivate {
        access(account) var releasedAt: UFix64
        access(account) var recipient: Address
        access(account) var balance: UFix64?

        init(
            releasedAt: UFix64,
            recipient: Address,
            balance: UFix64?
        ) {
            self.releasedAt = releasedAt
            self.recipient = recipient
            self.balance = balance
        }

        pub fun getInfo(): LockUpInfo {
            return LockUpInfo(
                owner: self.owner?.address,
                releasedAt: self.releasedAt,
                recipient: self.recipient,
                balance: self.balance
            )
        }

        pub fun withdraw(amount: UFix64, receiver: Capability<&{FungibleToken.Receiver}>) {
            let currentTime = getCurrentBlock().timestamp
            if self.releasedAt > currentTime {
                panic("The assets are still in lock-up period!")
            }

            if self.recipient != receiver.address {
                panic("Non authorized recipient!")
            }

            if self.balance != nil && amount > self.balance! {
                panic("You cannot withdraw more than the remaining balance of: ".concat(self.balance!.toString()))
            }

            let vaultCap = AssetHandover.vaultMappings[self.recipient] ?? panic("Unable to get FlowToken.Vault mapping for recipient")

            let vault = receiver.borrow() ?? panic("Could not borrow vault reference")
            // Withdraws the requested amount from the provided Vault, to one of the recipients
            vault.deposit(from: <- vaultCap.borrow()!.withdraw(amount: amount))

            if self.balance != nil {
                self.balance = self.balance! - amount

                if self.balance! == 0.0 {
                    emit LockUpBalanceWithdrawn(owner: self.owner!.address, recipient: self.recipient)
                }
            }

            emit LockUpWithdrawn(owner: self.owner!.address, recipient: self.recipient, amount: amount)
        }

        pub fun setReleasedAt(releasedAt: UFix64) {
            self.releasedAt = releasedAt
            emit LockUpReleasedAtChanged(owner: self.owner!.address, releasedAt: releasedAt)
        }

        pub fun setRecipient(recipient: Address) {
            self.recipient = recipient
            emit LockUpRecipientChanged(owner: self.owner!.address, recipient: recipient)
        }

        pub fun setBalance(balance: UFix64) {
            self.balance = balance
            emit LockUpBalanceChanged(owner: self.owner!.address, balance: balance)
        }
    }

    pub fun createLockUp(owner: Address, releasedAt: UFix64, recipient: Address, balance: UFix64?): @LockUp {
        let lockUp <- create LockUp(releasedAt: releasedAt, recipient: recipient, balance: balance)

        emit LockUpCreated(owner: owner, recipient: recipient)

        return <- lockUp
    }

    pub fun destroyLockUp(lockUp: @LockUp) {
        let lockUpInfo = lockUp.getInfo()

        destroy lockUp

        emit LockUpDestroyed(owner: lockUpInfo.owner!, recipient: lockUpInfo.recipient)
    }

    pub fun registerVault(recipient: Address, vault: Capability<&FlowToken.Vault>) {
        self.vaultMappings[recipient] = vault
    }

    pub fun checkRecipientVault(recipient: Address): Address {
        var vaultCap = self.vaultMappings[recipient]!
        if vaultCap == nil {
            panic("There is no registered FlowToken.Vault for the given recipient")
        }
        if vaultCap.check() == false {
            panic("Unable to get the FlowToken.Vault Capability")
        }

        let vaultRef = vaultCap.borrow() ?? panic("Unable to get the FlowToken.Vault reference")

        return vaultCap.address
    }
}
