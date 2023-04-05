import FungibleToken from "./interfaces/FungibleToken.cdc"
import FlowToken from "./tokens/FlowToken.cdc"
import NonFungibleToken from "./interfaces/NonFungibleToken.cdc"

pub contract AssetHandover {
    // Mapping with LockUp recipients as keys and LockUp
    // holders as values.
    pub let lockUpsMapping: {Address: [Address]}

    // Constants for all the available paths
    pub let LockUpStoragePath: StoragePath
    pub let LockUpPrivatePath: PrivatePath
    pub let LockUpPublicPath: PublicPath
    pub let AdminStoragePath: StoragePath
    pub let AdminPrivatePath: PrivatePath

    // Events emitted from the contract
    pub event LockUpCreated(holder: Address, recipient: Address)
    pub event LockUpDestroyed(holder: Address?, recipient: Address)
    pub event LockUpRecipientChanged(holder: Address, recipient: Address)
    pub event LockUpReleasedAtChanged(holder: Address, releasedAt: UInt64)
    pub event LockUpNameChanged(holder: Address, name: String)
    pub event LockUpDescriptionChanged(holder: Address, description: String)

    init() {
        self.lockUpsMapping = {}

        self.LockUpStoragePath = /storage/assetLockUp
        self.LockUpPrivatePath = /private/assetLockUp
        self.LockUpPublicPath = /public/assetLockUp
        self.AdminStoragePath = /storage/admin
        self.AdminPrivatePath = /private/admin

        let admin <- create Admin()
        self.account.save<@Admin>(<- admin, to: self.AdminStoragePath)

        self.account.link<&Admin>(
            self.AdminPrivatePath,
            target: self.AdminStoragePath
        )
    }

    pub struct FungibleTokenInfo {
        pub let name: String
        pub let receiverPath: PublicPath
        pub let balancePath: PublicPath
        pub let privatePath: PrivatePath
        pub let storagePath: StoragePath

        init(
            name: String,
            receiverPath: PublicPath,
            balancePath: PublicPath,
            privatePath: PrivatePath,
            storagePath: StoragePath
        ) {
            self.name = name
            self.receiverPath = receiverPath
            self.balancePath = balancePath
            self.privatePath = privatePath
            self.storagePath = storagePath
        }
    }

    pub struct NonFungibleTokenInfo {
        pub let name: String
        pub let publicPath: PublicPath
        pub let privatePath: PrivatePath
        pub let storagePath: StoragePath
        pub let publicType: Type
        pub let privateType: Type

        init(
            name: String,
            publicPath: PublicPath,
            privatePath: PrivatePath,
            storagePath: StoragePath,
            publicType: Type,
            privateType: Type
        ) {
            self.name = name
            self.publicPath = publicPath
            self.privatePath = privatePath
            self.storagePath = storagePath
            self.publicType = publicType
            self.privateType = privateType
        }
    }

    pub struct FTLockUpInfo {
        pub let identifier: String
        pub let balance: UFix64?

        init(identifier: String, balance: UFix64?) {
            self.identifier = identifier
            self.balance = balance
        }
    }

    pub struct NFTLockUpInfo {
        pub let identifier: String
        pub let nftIDs: [UInt64]?

        init(identifier: String, nftIDs: [UInt64]?) {
            self.identifier = identifier
            self.nftIDs = nftIDs
        }
    }

    pub struct LockUpInfo {
        pub let holder: Address
        pub let releasedAt: UInt64
        pub let createdAt: UInt64
        pub let name: String
        pub let description: String
        pub let recipient: Address
        pub let fungibleTokens: [FTLockUpInfo]
        pub let nonFungibleTokens: [NFTLockUpInfo]

        init(
            holder: Address,
            releasedAt: UInt64,
            createdAt: UInt64,
            name: String,
            description: String,
            recipient: Address,
            fungibleTokens: [FTLockUpInfo],
            nonFungibleTokens: [NFTLockUpInfo]
        ) {
            self.holder = holder
            self.releasedAt = releasedAt
            self.createdAt = createdAt
            self.name = name
            self.description = description
            self.recipient = recipient
            self.fungibleTokens = fungibleTokens
            self.nonFungibleTokens = nonFungibleTokens
        }
    }

    pub resource interface LockUpPublic {
        pub fun getInfo(): LockUpInfo

        // E.g Type<FlowToken>().identifier => A.7e60df042a9c0868.FlowToken
        pub fun withdrawFT(
            identifier: String,
            amount: UFix64,
            receiver: Capability<&{FungibleToken.Receiver}>,
            feeTokens: @FungibleToken.Vault
        )

        // E.g Type<Domains>().identifier => A.9a0766d93b6608b7.Domains
        pub fun withdrawNFT(
            identifier: String,
            receiver: Capability<&{NonFungibleToken.Receiver}>,
            feeTokens: @FungibleToken.Vault
        )
    }

    pub resource interface LockUpPrivate {
        pub fun lockFT(
            identifier: String,
            vault: Capability<&FungibleToken.Vault>,
            balance: UFix64?
        )

        pub fun lockNFT(
            identifier: String,
            collection: Capability<&NonFungibleToken.Collection>,
            nftIDs: [UInt64]?
        )

        pub fun setReleasedAt(releasedAt: UInt64)
        pub fun setName(name: String)
        pub fun setDescription(description: String)
        pub fun setRecipient(recipient: Address)
        pub fun setBalance(identifier: String, balance: UFix64)
        pub fun setNFTIDs(identifier: String, nftIDs: [UInt64])
    }

    pub struct FTLockUp {
        pub let vault: Capability<&FungibleToken.Vault>
        pub var balance: UFix64?

        init(
            vault: Capability<&FungibleToken.Vault>,
            balance: UFix64?
        ) {
            self.vault = vault
            self.balance = balance
        }

        pub fun updateBalance(balance: UFix64) {
            self.balance = balance
        }
    }

    pub struct NFTLockUp {
        pub let collection: Capability<&NonFungibleToken.Collection>
        pub var nftIDs: [UInt64]?

        init(
            collection: Capability<&NonFungibleToken.Collection>,
            nftIDs: [UInt64]?
        ) {
            self.collection = collection
            self.nftIDs = nftIDs
        }

        pub fun updateNFTIDs(nftIDs: [UInt64]) {
            self.nftIDs = nftIDs
        }
    }

    pub resource LockUp: LockUpPublic, LockUpPrivate {
        access(self) let holder: Address
        access(self) var releasedAt: UInt64
        access(self) var createdAt: UInt64
        access(self) var name: String
        access(self) var description: String
        access(self) var recipient: Address
        access(self) let ftLockUps: {String: FTLockUp}
        access(self) let nftLockUps: {String: NFTLockUp}

        init(
            holder: Address,
            releasedAt: UInt64,
            name: String,
            description: String,
            recipient: Address,
        ) {
            self.holder = holder
            self.releasedAt = releasedAt
            self.createdAt = UInt64(getCurrentBlock().timestamp)
            self.name = name
            self.description = description
            self.recipient = recipient
            self.ftLockUps = {}
            self.nftLockUps = {}
        }

        pub fun getInfo(): LockUpInfo {
            let fungibleTokens: [FTLockUpInfo] = []
            let nonFungibleTokens: [NFTLockUpInfo] = []

            for key in self.ftLockUps.keys {
                let ftLockUpInfo = FTLockUpInfo(
                    identifier: key,
                    balance: self.ftLockUps[key]!.balance
                )
                fungibleTokens.append(ftLockUpInfo)
            }

            for key in self.nftLockUps.keys {
                let nftLockUpInfo = NFTLockUpInfo(
                    identifier: key,
                    nftIDs: self.nftLockUps[key]!.nftIDs
                )
                nonFungibleTokens.append(nftLockUpInfo)
            }

            return LockUpInfo(
                holder: self.holder,
                releasedAt: self.releasedAt,
                createdAt: self.createdAt,
                name: self.name,
                description: self.description,
                recipient: self.recipient,
                fungibleTokens: fungibleTokens,
                nonFungibleTokens: nonFungibleTokens
            )
        }

        pub fun withdrawFT(
            identifier: String,
            amount: UFix64,
            receiver: Capability<&{FungibleToken.Receiver}>,
            feeTokens: @FungibleToken.Vault
        ) {
            let currentTime = UInt64(getCurrentBlock().timestamp)
            if self.releasedAt > currentTime {
                panic("The assets are still in lock-up period.")
            }

            if self.recipient != receiver.address {
                panic("Non-authorized recipient.")
            }

            let ftLockUp = self.ftLockUps[identifier]
                ?? panic("Non-supported FungibleToken.")

            if ftLockUp.balance != nil && amount > ftLockUp.balance! {
                panic(
                    "You cannot withdraw more than the remaining balance of: "
                    .concat(ftLockUp.balance!.toString())
                )
            }

            let ownerVault = ftLockUp.vault.borrow()
                ?? panic("Could not borrow FungibleToken.Vault reference.")
            let recipientvault = receiver.borrow()
                ?? panic("Could not borrow FungibleToken.Receiver reference.")

            let admin = AssetHandover.getAdmin()
            let feeSent = feeTokens.balance

            if feeSent < admin.lockUpWithdrawFees {
                panic(
                    "You did not send enough FLOW tokens. Expected: "
                    .concat(admin.lockUpWithdrawFees.toString())
                )
            }

            // Withdraws the requested amount from the owner's vault
            // and deposits it to the recipient's vault
            recipientvault.deposit(from: <- ownerVault.withdraw(amount: amount))

            if ftLockUp.balance != nil {
                self.ftLockUps[identifier]!.updateBalance(balance: ftLockUp.balance! - amount)
            }

            admin.deposit(feeTokens: <- feeTokens)
        }

        pub fun withdrawNFT(
            identifier: String,
            receiver: Capability<&{NonFungibleToken.Receiver}>,
            feeTokens: @FungibleToken.Vault
        ) {
            let currentTime = UInt64(getCurrentBlock().timestamp)
            if self.releasedAt > currentTime {
                panic("The assets are still in lock-up period!")
            }

            if self.recipient != receiver.address {
                panic("Non authorized recipient!")
            }

            let nftLockUp = self.nftLockUps[identifier]
                ?? panic("Non-supported FungibleToken.")

            let receiverRef = receiver.borrow()
                ?? panic("Could not borrow NonFungibleToken.Receiver reference.")
            let collectionRef = nftLockUp.collection.borrow()
                ?? panic("Could not borrow NonFungibleToken.Collection reference.")

            let admin = AssetHandover.getAdmin()
            let feeSent = feeTokens.balance

            if feeSent < admin.lockUpWithdrawFees {
                panic(
                    "You did not send enough FLOW tokens. Expected: "
                    .concat(admin.lockUpWithdrawFees.toString())
                )
            }

            var nftIDs: [UInt64] = []
            let currentCollectionIDs = collectionRef.getIDs()

            if nftLockUp.nftIDs!.length > 0 {
                nftIDs = nftLockUp.nftIDs!
            } else {
                nftIDs = currentCollectionIDs
            }

            for id in nftIDs {
                if !currentCollectionIDs.contains(id) {
                    continue
                }
                let nft <- collectionRef.withdraw(withdrawID: id)
                receiverRef.deposit(token: <- nft)
            }

            self.nftLockUps[identifier]!.updateNFTIDs(nftIDs: [])
            admin.deposit(feeTokens: <- feeTokens)
        }

        pub fun lockFT(
            identifier: String,
            vault: Capability<&FungibleToken.Vault>,
            balance: UFix64?
        ) {
            self.ftLockUps[identifier] = FTLockUp(
                vault: vault,
                balance: balance
            )
        }

        pub fun lockNFT(
            identifier: String,
            collection: Capability<&NonFungibleToken.Collection>,
            nftIDs: [UInt64]?
        ) {
            if nftIDs != nil && nftIDs!.length > 0 {
                self.checkNFTExistence(
                    collection: collection,
                    nftIDs: nftIDs!
                )
            }

            self.nftLockUps[identifier] = NFTLockUp(
                collection: collection,
                nftIDs: nftIDs
            )
        }

        pub fun setReleasedAt(releasedAt: UInt64) {
            self.releasedAt = releasedAt
            emit LockUpReleasedAtChanged(holder: self.holder, releasedAt: releasedAt)
        }

        pub fun setName(name: String) {
            self.name = name
            emit LockUpNameChanged(holder: self.holder, name: name)
        }

        pub fun setDescription(description: String) {
            self.description = description
            emit LockUpDescriptionChanged(holder: self.holder, description: description)
        }

        pub fun setRecipient(recipient: Address) {
            AssetHandover.removeFromLockUpsMapping(holder: self.holder, recipient: self.recipient)
            self.recipient = recipient
            AssetHandover.addToLockUpsMapping(holder: self.holder, recipient: self.recipient)
            emit LockUpRecipientChanged(holder: self.holder, recipient: recipient)
        }

        pub fun setBalance(identifier: String, balance: UFix64) {
            if !self.ftLockUps.containsKey(identifier) {
                panic("Non-supported FungibleToken.")
            }
            self.ftLockUps[identifier]!.updateBalance(balance: balance)
        }

        pub fun setNFTIDs(identifier: String, nftIDs: [UInt64]) {
            if !self.nftLockUps.containsKey(identifier) {
                panic("Non-supported NonFungibleToken.")
            }

            if nftIDs.length > 0 {
                self.checkNFTExistence(
                    collection: self.nftLockUps[identifier]!.collection,
                    nftIDs: nftIDs
                )
            }

            self.nftLockUps[identifier]!.updateNFTIDs(nftIDs: nftIDs)
        }

        priv fun checkNFTExistence(
            collection: Capability<&NonFungibleToken.Collection>,
            nftIDs: [UInt64]
        ) {
            let collectionRef = collection.borrow()
                ?? panic("Could not borrow NonFungibleToken.Collection reference.")

            for nftID in nftIDs {
                let nft = collectionRef.borrowNFT(id: nftID)
            }
        }

        destroy() {
            AssetHandover.removeFromLockUpsMapping(holder: self.holder, recipient: self.recipient)
            emit LockUpDestroyed(holder: self.holder, recipient: self.recipient)
        }
    }

    pub resource Admin {
        access(contract) var lockUpCreationFees: UFix64
        access(contract) var lockUpWithdrawFees: UFix64
        access(contract) let feesVault: @FungibleToken.Vault
        access(contract) let fungibleTokenInfoMapping: {String: FungibleTokenInfo}
        access(contract) let nonFungibleTokenInfoMapping: {String: NonFungibleTokenInfo}

        init() {
            self.lockUpCreationFees = 5.0
            self.lockUpWithdrawFees = 2.0
            self.feesVault <- FlowToken.createEmptyVault()
            self.fungibleTokenInfoMapping = {}
            self.nonFungibleTokenInfoMapping = {}
        }

        pub fun addFungibleTokenInfo(identifier: String, tokenInfo: FungibleTokenInfo) {
            self.fungibleTokenInfoMapping[identifier] = tokenInfo
        }

        pub fun addNonFungibleTokenInfo(identifier: String, tokenInfo: NonFungibleTokenInfo) {
            self.nonFungibleTokenInfoMapping[identifier] = tokenInfo
        }

        pub fun updateCreationFees(fees: UFix64) {
            self.lockUpCreationFees = fees
        }

        pub fun updateWithdrawFees(fees: UFix64) {
            self.lockUpWithdrawFees = fees
        }

        pub fun deposit(feeTokens: @FungibleToken.Vault) {
            self.feesVault.deposit(from: <- feeTokens)
        }

        destroy() {
            destroy self.feesVault
        }
    }

    pub fun createLockUp(
        holder: Address,
        releasedAt: UInt64,
        name: String,
        description: String,
        recipient: Address,
        feeTokens: @FungibleToken.Vault
    ): @LockUp {
        pre {
            releasedAt > UInt64(getCurrentBlock().timestamp) : "releasedAt should be a future date timestamp"
        }

        let admin = self.getAdmin()
        let feeSent = feeTokens.balance

        if feeSent < admin.lockUpCreationFees {
            panic(
                "You did not send enough FLOW tokens. Expected: "
                .concat(admin.lockUpCreationFees.toString())
            )
        }

        let lockUp <- create LockUp(
            holder: holder,
            releasedAt: releasedAt,
            name: name,
            description: description,
            recipient: recipient
        )

        AssetHandover.addToLockUpsMapping(holder: holder, recipient: recipient)

        emit LockUpCreated(holder: holder, recipient: recipient)

        admin.deposit(feeTokens: <- feeTokens)

        return <- lockUp
    }

    pub fun getFungibleTokenInfoMapping(): {String: FungibleTokenInfo} {
        let admin = self.getAdmin()

        return admin.fungibleTokenInfoMapping
    }

    pub fun getNonFungibleTokenInfoMapping(): {String: NonFungibleTokenInfo} {
        let admin = self.getAdmin()

        return admin.nonFungibleTokenInfoMapping
    }

    pub fun getCreationFees(): UFix64 {
        let admin = self.getAdmin()

        return admin.lockUpCreationFees
    }

    pub fun getWithdrawFees(): UFix64 {
        let admin = self.getAdmin()

        return admin.lockUpWithdrawFees
    }

    access(contract) fun addToLockUpsMapping(holder: Address, recipient: Address) {
        if self.lockUpsMapping.containsKey(recipient) {
            self.lockUpsMapping[recipient]!.append(holder)
        } else {
            self.lockUpsMapping[recipient] = [holder]
        }
    }

    access(contract) fun removeFromLockUpsMapping(holder: Address, recipient: Address) {
        if !self.lockUpsMapping.containsKey(recipient) {
            return
        }

        let holders = self.lockUpsMapping[recipient]!
        var index: Int = 0

        for h in holders {
            if h == holder {
                break
            }
            index = index + 1
        }

        holders.remove(at: index)

        self.lockUpsMapping[recipient] = holders
    }

    access(contract) fun getAdmin(): &Admin {
        let admin = self.account.getCapability(
            self.AdminPrivatePath
        ).borrow<&Admin>()
        ?? panic("Could not borrow AssetHandover.Admin reference.")

        return admin
    }
}
