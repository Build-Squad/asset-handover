import FungibleToken from "./interfaces/FungibleToken.cdc"

pub contract AssetHandover {
    pub let LockUpStoragePath: StoragePath
    pub let LockUpPrivatePath: PrivatePath
    pub let LockUpPublicPath: PublicPath

    init() {
        self.LockUpStoragePath = /storage/lockUps
        self.LockUpPrivatePath = /private/lockUps
        self.LockUpPublicPath = /public/lockUps
    }

    pub struct LockUpInfo {
        pub let owner: Address
        pub let releasedAt: UFix64
        pub let recipient: Address

        init(owner: Address, releasedAt: UFix64, recipient: Address) {
            self.owner = owner
            self.releasedAt = releasedAt
            self.recipient = recipient
        }
    }

    pub resource LockUp {
        access(account) var releasedAt: UFix64
        access(account) var recipient: Address
        access(account) var providerCap: Capability<&AnyResource{FungibleToken.Provider}>

        init(releasedAt: UFix64, recipient: Address, providerCap: Capability<&AnyResource{FungibleToken.Provider}>) {
            self.releasedAt = releasedAt
            self.recipient = recipient
            self.providerCap = providerCap
        }

        pub fun withdraw(amount: UFix64, receiver: Capability<&{FungibleToken.Receiver}>) {
            let currentTime = getCurrentBlock().timestamp
            if self.releasedAt > currentTime {
                panic("The assets are still in lock-up period!")
            }

            if self.recipient != receiver.address {
                panic("Non authorized recipient!")
            }

            let vault = receiver.borrow() ?? panic("Could not borrow vault reference")
            // Withdraws the requested amount from the provided Vault, to one of the recipients
            vault.deposit(from: <- self.providerCap.borrow()!.withdraw(amount: amount))
        }

        pub fun getInfo(): LockUpInfo {
            return LockUpInfo(
                owner: self.owner!.address,
                releasedAt: self.releasedAt,
                recipient: self.recipient
            )
        }

        access(account) fun setReleasedAt(releasedAt: UFix64) {
            self.releasedAt = releasedAt
        }

        access(account) fun setRecipient(recipient: Address) {
            self.recipient = recipient
        }
    }

    pub fun createLockUp(releasedAt: UFix64, recipient: Address, providerCap: Capability<&AnyResource{FungibleToken.Provider}>): @LockUp {
        return <- create LockUp(releasedAt: releasedAt, recipient: recipient, providerCap: providerCap)
    }
}
