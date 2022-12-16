import FungibleToken from "../interfaces/FungibleToken.cdc"
import FlowToken from "../tokens/FlowToken.cdc"
import NonFungibleToken from "../interfaces/NonFungibleToken.cdc"
import MetadataViews from "../utility/MetadataViews.cdc"

pub contract Domains: NonFungibleToken {
    // Chars that are forbidden from being present in Domain names
    pub let forbiddenChars: String

    // Mapping that associates domain name hashes to owner addresses
    pub let owners: {String: Address}

    // Mapping that associates domain name hashes with their expiration times
    pub let expirationTimes: {String: UFix64}

    // Mapping that associates domain name hashes with their NFT IDs
    pub let nameHashToIDs: {String: UInt64}

    // The total number of tokens of this type in existence
    pub var totalSupply: UInt64

    // Paths for Domains
    pub let DomainsStoragePath: StoragePath
    pub let DomainsPrivatePath: PrivatePath
    pub let DomainsPublicPath: PublicPath

    // Paths for Registrar
    pub let RegistrarStoragePath: StoragePath
    pub let RegistrarPrivatePath: PrivatePath
    pub let RegistrarPublicPath: PublicPath

    // NonFungibleToken contract interface events
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)

    // Custom events from Domains contract
    pub event DomainBioChanged(nameHash: String, bio: String)
    pub event DomainAddressChanged(nameHash: String, address: Address)
    pub event DomainMinted(id: UInt64, name: String, nameHash: String, expiresAt: UFix64, receiver: Address)
    pub event DomainRenewed(id: UInt64, name: String, nameHash: String, expiresAt: UFix64, receiver: Address)

    init() {
        self.owners = {}
        self.expirationTimes = {}
        self.nameHashToIDs = {}

        self.forbiddenChars = "!@#$%^&*()<>? ./"
        self.totalSupply = 0

        self.DomainsStoragePath = StoragePath(identifier: "flowNameServiceDomains") ?? panic("Could not set storage path")
        self.DomainsPrivatePath = PrivatePath(identifier: "flowNameServiceDomains") ?? panic("Could not set private path")
        self.DomainsPublicPath = PublicPath(identifier: "flowNameServiceDomains") ?? panic("Could not set public path")

        self.RegistrarStoragePath = StoragePath(identifier: "flowNameServiceRegistrar") ?? panic("Could not set storage path")
        self.RegistrarPrivatePath = PrivatePath(identifier: "flowNameServiceRegistrar") ?? panic("Could not set private path")
        self.RegistrarPublicPath = PublicPath(identifier: "flowNameServiceRegistrar") ?? panic("Could not set public path")

        // Create the Collection resource and save it in the DomainsStoragePath
        self.account.save(<- self.createEmptyCollection(), to: Domains.DomainsStoragePath)
        // This Capability only allows for calling these functions: deposit() / getIDs() / borrowNFT() / borrowDomain()
        self.account.link<&Domains.Collection{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, Domains.CollectionPublic, MetadataViews.ResolverCollection}>(
            self.DomainsPublicPath, target: self.DomainsStoragePath
        )
        // This Capability allows accessing all fields and functions of the Domains.Collection resource
        self.account.link<&Domains.Collection>(self.DomainsPrivatePath, target: self.DomainsStoragePath)

        // Fetch the private Capability for the Domains.Collection resource
        let collectionCapability = self.account.getCapability<&Domains.Collection>(self.DomainsPrivatePath)
        // Create a FlowToken.Vault resource
        let vault <- FlowToken.createEmptyVault()
        // Create the Registrar resource with the provided vault resource and the collection Capability
        let registrar <- create Registrar(vault: <- vault, collection: collectionCapability)

        // Save the Registrar resource in the RegistrarStoragePath
        self.account.save(<- registrar, to: self.RegistrarStoragePath)
        // This Capability only allows for calling these functions: renewDomain() / registerDomain() / getPrices() / getVaultBalance()
        self.account.link<&Domains.Registrar{Domains.RegistrarPublic}>(self.RegistrarPublicPath, target: self.RegistrarStoragePath)
        // This Capability allows accessing all fields and functions of the Domains.Registrar resource
        self.account.link<&Domains.Registrar>(self.RegistrarPrivatePath, target: self.RegistrarStoragePath)

        // After everything is properly initialized, emit the ContractInitialized event
        emit ContractInitialized()
    }

    pub struct DomainInfo {
        // This is the NFT ID, coming from the NonFungibleToken.INFT resource interface
        pub let id: UInt64
        pub let owner: Address
        pub let name: String
        pub let nameHash: String
        pub let expiresAt: UFix64
        pub let address: Address?
        pub let bio: String
        pub let createdAt: UFix64

        init(
            id: UInt64,
            owner: Address,
            name: String,
            nameHash: String,
            expiresAt: UFix64,
            address: Address?,
            bio: String,
            createdAt: UFix64
        ) {
            self.id = id
            self.owner = owner
            self.name = name
            self.nameHash = nameHash
            self.expiresAt = expiresAt
            self.address = address
            self.bio = bio
            self.createdAt = createdAt
        }
    }

    pub resource interface DomainPublic {
        pub let id: UInt64
        pub let name: String
        pub let nameHash: String
        pub let createdAt: UFix64

        pub fun getBio(): String
        pub fun getAddress(): Address?
        pub fun getDomainName(): String
        pub fun getInfo(): DomainInfo
    }

    pub resource interface DomainPrivate {
        pub fun setBio(bio: String)
        pub fun setAddress(addr: Address)
    }

    pub resource NFT: DomainPublic, DomainPrivate, NonFungibleToken.INFT, MetadataViews.Resolver {
        pub let id: UInt64
        pub let name: String
        pub let nameHash: String
        pub let createdAt: UFix64

        // Only the code of the current resource can access the two following fields
        access(self) var address: Address?
        access(self) var bio: String

        init(id: UInt64, name: String, nameHash: String) {
            self.id = id
            self.name = name
            self.nameHash = nameHash
            self.createdAt = getCurrentBlock().timestamp
            self.address = nil
            self.bio = ""
        }

        pub fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.NFTCollectionData>()
            ]
        }

        pub fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: self.name,
                        description: self.bio,
                        thumbnail: MetadataViews.HTTPFile(
                            url: "https://www.flow-domains.com/".concat(self.nameHash)
                        )
                    )
                case Type<MetadataViews.NFTCollectionData>():
                    return MetadataViews.NFTCollectionData(
                        storagePath: Domains.DomainsStoragePath,
                        publicPath: Domains.DomainsPublicPath,
                        providerPath: Domains.DomainsPrivatePath,
                        publicCollection: Type<&Domains.Collection{Domains.CollectionPublic}>(),
                        publicLinkedType: Type<&Domains.Collection{Domains.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(),
                        providerLinkedType: Type<&Domains.Collection>(),
                        createEmptyCollectionFunction: (fun (): @NonFungibleToken.Collection {
                            return <-Domains.createEmptyCollection()
                        })
                    )
            }

            return nil
        }

        pub fun getBio(): String {
            return self.bio
        }

        pub fun setBio(bio: String) {
            pre {
                Domains.isExpired(nameHash: self.nameHash) == false : "Domain is expired"
            }
            self.bio = bio
            emit DomainBioChanged(nameHash: self.nameHash, bio: bio)
        }

        pub fun getAddress(): Address? {
            return self.address
        }

        pub fun setAddress(addr: Address) {
            pre {
                Domains.isExpired(nameHash: self.nameHash) == false : "Domain is expired"
            }
            self.address = addr
            emit DomainAddressChanged(nameHash: self.nameHash, address: addr)
        }

        pub fun getDomainName(): String {
            return self.name.concat(".fns")
        }

        pub fun getInfo(): DomainInfo {
            // Fetch the owner from the owners mapping defined in the contract
            let owner = Domains.owners[self.nameHash]!
            // Fetch the expiresAt from the expirationTimes mapping defined in the contract
            let expiresAt = Domains.expirationTimes[self.nameHash]!

            return DomainInfo(
                id: self.id,
                owner: owner,
                name: self.getDomainName(),
                nameHash: self.nameHash,
                expiresAt: expiresAt,
                address: self.address,
                bio: self.bio,
                createdAt: self.createdAt
            )
        }
    }

    pub resource interface CollectionPublic {
        // Returns a reference to a Domains.NFT resource, by only allowing
        // access to the fields and functions defined in the
        // Domains.DomainPublic resource interface.
        // Fields: id, name, nameHash, createdAt
        // Functions: getBio(), getAddress(), getDomainName(), getInfo()
        pub fun borrowDomain(id: UInt64): &{Domains.DomainPublic}
    }

    pub resource interface CollectionPrivate {
        // Only the account deploying the Domains contract, can call this function
        access(account) fun mintDomain(name: String, nameHash: String, expiresAt: UFix64, receiver: Capability<&{NonFungibleToken.Receiver}>) {
            post {
                Domains.totalSupply > before(Domains.totalSupply): "Total Supply was not changed"
            }
        }
        // Returns a reference to a Domains.NFT resource
        pub fun borrowDomainPrivate(id: UInt64): &Domains.NFT
    }

    pub resource Collection: CollectionPublic, CollectionPrivate, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {
        // Mapping that associates the NFT Token IDs with their resources
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init() {
            self.ownedNFTs <- {}
        }

        // Implements the NonFungibleToken.Provider resource interface
        // for withdrawing an NFT from the collection
        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let domain <- self.ownedNFTs.remove(key: withdrawID) ?? panic("NFT not found in collection")
            emit Withdraw(id: domain.id, from: self.owner?.address)
            return <- domain
        }

        // Implements the NonFungibleToken.Receiver resource interface
        // for depositing an NFT to a collection
        pub fun deposit(token: @NonFungibleToken.NFT) {
            // Typecast the token argument to a Domains.NFT resource
            // for accessing the id and nameHash properties
            let domain <- token as! @Domains.NFT
            let id = domain.id
            let nameHash = domain.nameHash

            if Domains.isExpired(nameHash: nameHash) {
                panic("Domain is expired")
            }

            // Update the owners mapping with the new owner of the Domain
            Domains.updateOwner(nameHash: nameHash, address: self.owner!.address)

            // Assign the Domain resource to the ownedNFTs mapping
            let oldToken <- self.ownedNFTs[id] <- domain
            // Emit the Deposit event
            emit Deposit(id: id, to: self.owner?.address)

            destroy oldToken
        }

        // Implements the NonFungibleToken.CollectionPublic resource interface
        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        // Implements the NonFungibleToken.CollectionPublic resource interface
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            // We have to return a reference to our resource in the mapping
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }

        // Implements the Domains.CollectionPublic resource interface
        // Returns a reference to a Domains.NFT resource,
        // with the Domains.DomainPublic resource interface
        pub fun borrowDomain(id: UInt64): &{Domains.DomainPublic} {
            pre {
                self.ownedNFTs[id] != nil : "Domain does not exist in the collection"
            }

            // We need an authorized reference, to downcast to &Domains.NFT
            let token = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            return token as! &Domains.NFT
        }

        // Implements the Domains.CollectionPrivate resource interface
        access(account) fun mintDomain(name: String, nameHash: String, expiresAt: UFix64, receiver: Capability<&{NonFungibleToken.Receiver}>){
            pre {
                Domains.isAvailable(nameHash: nameHash) : "Domain not available"
            }

            // This is the actual Domain resource creation
            let domain <- create Domains.NFT(
                id: Domains.totalSupply,
                name: name,
                nameHash: nameHash
            )

            // Update the owners mapping defined in the contract level
            Domains.updateOwner(nameHash: nameHash, address: receiver.address)
            // Update the expirationTimes mapping defined in the contract level
            Domains.updateExpirationTime(nameHash: nameHash, expTime: expiresAt)
            // Update the nameHashToID mapping defined in the contract level
            Domains.updateNameHashToID(nameHash: nameHash, id: domain.id)
            // Increment the totalSupply var by 1
            Domains.totalSupply = Domains.totalSupply + 1

            // Emit the DomainMinted event
            emit DomainMinted(id: domain.id, name: name, nameHash: nameHash, expiresAt: expiresAt, receiver: receiver.address)

            // Borrow the Receiver capability in order to deposit the token
            // to the given address
            receiver.borrow()!.deposit(token: <- domain)
        }

        // Implements the Domains.CollectionPrivate resource interface
        // Returns a type-casted Domains.NFT resource, instead of just an NFT
        pub fun borrowDomainPrivate(id: UInt64): &Domains.NFT {
            pre {
                self.ownedNFTs[id] != nil: "Domain does not exist in the collection"
            }
            // We need an authorized reference, to downcast to &Domains.NFT
            let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            return ref as! &Domains.NFT
        }

        /// Gets a reference to the NFT only conforming to the `{MetadataViews.Resolver}`
        /// interface so that the caller can retrieve the views that the NFT
        /// is implementing and resolve them
        ///
        /// @param id: The ID of the wanted NFT
        /// @return The resource reference conforming to the Resolver interface
        ///
        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let domainsNFT = nft as! &Domains.NFT
            return domainsNFT
        }

        // Destructor for the ownedNFTs mapping
        destroy() {
            destroy self.ownedNFTs
        }
    }

    pub resource interface RegistrarPublic {
        pub let minRentDuration: UFix64
        pub let maxDomainLength: Int
        pub let prices: {Int: UFix64}

        pub fun renewDomain(domain: &Domains.NFT, duration: UFix64, feeTokens: @FungibleToken.Vault)
        pub fun registerDomain(name: String, duration: UFix64, feeTokens: @FungibleToken.Vault, receiver: Capability<&{NonFungibleToken.Receiver}>)
        pub fun getPrices(): {Int: UFix64}
        pub fun getVaultBalance(): UFix64
    }

    pub resource interface RegistrarPrivate {
        pub fun updateRentVault(vault: @FungibleToken.Vault)
        pub fun withdrawVault(receiver: Capability<&{FungibleToken.Receiver}>, amount: UFix64)
        pub fun setPrices(key: Int, val: UFix64)
    }

    pub resource Registrar: RegistrarPublic, RegistrarPrivate {
        pub let minRentDuration: UFix64
        pub let maxDomainLength: Int
        pub let prices: {Int: UFix64}

        access(self) var rentVault: @FungibleToken.Vault
        access(account) var domainsCollection: Capability<&Domains.Collection>

        init(vault: @FungibleToken.Vault, collection: Capability<&Domains.Collection>) {
            self.minRentDuration = UFix64(365 * 24 * 60 * 60)
            self.maxDomainLength = 30
            self.prices = {}

            self.rentVault <- vault
            self.domainsCollection = collection
        }

        // Implements the Domains.RegistrarPublic resource interface
        pub fun renewDomain(domain: &Domains.NFT, duration: UFix64, feeTokens: @FungibleToken.Vault) {
            var len = domain.name.length
            if len > 10 {
                len = 10
            }

            let price = self.getPrices()[len]

            if duration < self.minRentDuration {
                panic("Domain must be registered for at least the minimum duration: ".concat(self.minRentDuration.toString()))
            }

            if price == 0.0 || price == nil {
                panic("Price has not been set for this length of domain")
            }

            let rentCost = price! * duration
            let feeSent = feeTokens.balance

            if feeSent < rentCost {
                panic("You did not send enough FLOW tokens. Expected: ".concat(rentCost.toString()))
            }

            // Deposit the tokens sent to our Vault
            self.rentVault.deposit(from: <- feeTokens)

            let newExpTime = Domains.getExpirationTime(nameHash: domain.nameHash)! + duration
            // Update the expirationTimes mapping defined in the contract level
            Domains.updateExpirationTime(nameHash: domain.nameHash, expTime: newExpTime)

            // Emit the DomainRenewed event
            emit DomainRenewed(id: domain.id, name: domain.name, nameHash: domain.nameHash, expiresAt: newExpTime, receiver: domain.owner!.address)
        }

        // Implements the Domains.RegistrarPublic resource interface
        pub fun registerDomain(name: String, duration: UFix64, feeTokens: @FungibleToken.Vault, receiver: Capability<&{NonFungibleToken.Receiver}>) {
            pre {
                name.length <= self.maxDomainLength : "Domain name is too long"
            }

            let nameHash = Domains.getDomainNameHash(name: name)
            if Domains.isAvailable(nameHash: nameHash) == false {
                panic("Domain is not available")
            }

            var len = name.length
            if len > 10 {
                len = 10
            }

            let price = self.getPrices()[len]

            if duration < self.minRentDuration {
                panic("Domain must be registered for at least the minimum duration: ".concat(self.minRentDuration.toString()))
            }

            if price == 0.0 || price == nil {
                panic("Price has not been set for this length of domain")
            }

            let rentCost = price! * duration
            let feeSent = feeTokens.balance

            if feeSent < rentCost {
                panic("You did not send enough FLOW tokens. Expected: ".concat(rentCost.toString()))
            }

            // Deposit the tokens sent to our Vault
            self.rentVault.deposit(from: <- feeTokens)

            let expirationTime = getCurrentBlock().timestamp + duration

            // Borrow the private Domains.Collection capability and mint a new Domains.NFT token
            // Event DomainMinted is emitted from mintDomain
            self.domainsCollection.borrow()!.mintDomain(name: name, nameHash: nameHash, expiresAt: expirationTime, receiver: receiver)
        }

        // Implements the Domains.RegistrarPublic resource interface
        pub fun getPrices(): {Int: UFix64} {
            return self.prices
        }

        // Implements the Domains.RegistrarPublic resource interface
        pub fun getVaultBalance(): UFix64 {
            return self.rentVault.balance
        }

        // Implements the Domains.RegistrarPrivate resource interface
        pub fun updateRentVault(vault: @FungibleToken.Vault) {
            pre {
                self.rentVault.balance == 0.0 : "Withdraw balance from old vault before updating"
            }

            // It updates the Vault used to keep the rent fees sent to us
            let oldVault <- self.rentVault <- vault
            destroy oldVault
        }

        // Implements the Domains.RegistrarPrivate resource interface
        pub fun withdrawVault(receiver: Capability<&{FungibleToken.Receiver}>, amount: UFix64) {
            let vault = receiver.borrow()!
            // Withdraws the given amount from our Vault, to another one
            vault.deposit(from: <- self.rentVault.withdraw(amount: amount))
        }

        // Implements the Domains.RegistrarPrivate resource interface
        pub fun setPrices(key: Int, val: UFix64) {
            self.prices[key] = val
        }

        destroy() {
            destroy self.rentVault
        }
    }

    // Global Functions

    // Implements the NonFungibleToken contract interface
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }

    pub fun getPrices(): {Int: UFix64} {
        let cap = self.account.getCapability<&Domains.Registrar{Domains.RegistrarPublic}>(Domains.RegistrarPublicPath)
        let registrar = cap.borrow() ?? panic("Could not borrow Registrar reference")
        return registrar.getPrices()
    }

    pub fun getVaultBalance(): UFix64 {
        let cap = self.account.getCapability<&Domains.Registrar{Domains.RegistrarPublic}>(Domains.RegistrarPublicPath)
        let registrar = cap.borrow() ?? panic("Could not borrow Registrar reference")
        return registrar.getVaultBalance()
    }

    pub fun getDomainNameHash(name: String): String {
        let forbiddenCharsUTF8 = self.forbiddenChars.utf8
        let nameUTF8 = name.utf8

        for char in forbiddenCharsUTF8 {
            if nameUTF8.contains(char) {
                panic("Illegal domain name")
            }
        }

        let nameHash = String.encodeHex(HashAlgorithm.SHA3_256.hash(nameUTF8))
        return nameHash
    }

    pub fun getRentCost(name: String, duration: UFix64): UFix64 {
        var len = name.length
        if len > 10 {
            len = 10
        }

        let price = self.getPrices()[len]

        let rentCost = price! * duration
        return rentCost
    }

    pub fun isAvailable(nameHash: String): Bool {
        if self.owners[nameHash] == nil {
            return true
        }
        return self.isExpired(nameHash: nameHash)
    }

    pub fun getAllOwners(): {String: Address} {
        return self.owners
    }

    pub fun getAllExpirationTimes(): {String: UFix64} {
        return self.expirationTimes
    }

    pub fun getAllNameHashToIDs(): {String: UInt64} {
        return self.nameHashToIDs
    }

    pub fun getExpirationTime(nameHash: String): UFix64? {
        return self.expirationTimes[nameHash]
    }

    pub fun isExpired(nameHash: String): Bool {
        let currTime = getCurrentBlock().timestamp
        let expTime = self.expirationTimes[nameHash]
        if expTime != nil {
            return currTime >= expTime!
        }
        return false
    }

    pub fun registerDomain(name: String, duration: UFix64, feeTokens: @FungibleToken.Vault, receiver: Capability<&{NonFungibleToken.Receiver}>) {
        let cap = self.account.getCapability<&Domains.Registrar{Domains.RegistrarPublic}>(self.RegistrarPublicPath)
        let registrar = cap.borrow() ?? panic("Could not borrow Registrar reference")
        registrar.registerDomain(name: name, duration: duration, feeTokens: <- feeTokens, receiver: receiver)
    }

    pub fun renewDomain(domain: &Domains.NFT, duration: UFix64, feeTokens: @FungibleToken.Vault) {
        let cap = self.account.getCapability<&Domains.Registrar{Domains.RegistrarPublic}>(self.RegistrarPublicPath)
        let registrar = cap.borrow() ?? panic("Could not borrow Registrar reference")
        registrar.renewDomain(domain: domain, duration: duration, feeTokens: <- feeTokens)
    }

    access(account) fun updateOwner(nameHash: String, address: Address) {
        self.owners[nameHash] = address
    }

    access(account) fun updateExpirationTime(nameHash: String, expTime: UFix64) {
        self.expirationTimes[nameHash] = expTime
    }

    access(account) fun updateNameHashToID(nameHash: String, id: UInt64) {
        self.nameHashToIDs[nameHash] = id
    }
}
