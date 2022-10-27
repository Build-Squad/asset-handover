import FungibleToken from "./interfaces/FungibleToken.cdc"

pub contract AssetHandover {
    // Define constants for all the available paths
    pub let LockUpStoragePath: StoragePath
    pub let LockUpPrivatePath: PrivatePath
    pub let LockUpPublicPath: PublicPath

    // Define the events emitted from the contract
    pub event LockUpCreated(owner: Address, recipient: Address)
    pub event LockUpDestroyed(owner: Address, recipient: Address)
    pub event LockUpRecipientChanged(owner: Address, recipient: Address)
    pub event LockUpReleasedAtChanged(owner: Address, releasedAt: UFix64)
    pub event LockUpBalanceChanged(owner: Address, balance: UFix64)
    pub event LockUpWithdrawn(owner: Address, recipient: Address, amount: UFix64)
    pub event LockUpBalanceWithdrawn(owner: Address, recipient: Address)

    init() {
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
        access(account) let vault: Capability<&FlowToken.Vault>

        init(
            releasedAt: UFix64,
            recipient: Address,
            balance: UFix64?,
            vault: Capability<&FlowToken.Vault>
        ) {
            self.releasedAt = releasedAt
            self.recipient = recipient
            self.balance = balance
            self.vault = vault
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

            let ownerVault = self.vault.borrow() ?? panic("Could not borrow owner vault reference!")
            let recipientvault = receiver.borrow() ?? panic("Could not borrow recipient vault reference!")
            // Withdraws the requested amount from the owner's vault, to the one of the recipient
            recipientvault.deposit(from: <- ownerVault.withdraw(amount: amount))

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

    pub fun createLockUp(releasedAt: UFix64, recipient: Address, balance: UFix64?, vault: Capability<&FlowToken.Vault>): @LockUp {
        let lockUp <- create LockUp(releasedAt: releasedAt, recipient: recipient, balance: balance, vault: vault)

        emit LockUpCreated(owner: vault.address, recipient: recipient)

        return <- lockUp
    }

    pub fun destroyLockUp(lockUp: @LockUp) {
        let lockUpInfo = lockUp.getInfo()

        destroy lockUp

        emit LockUpDestroyed(owner: lockUpInfo.owner!, recipient: lockUpInfo.recipient)
    }
}
