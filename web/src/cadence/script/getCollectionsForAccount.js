export const getCollectionsForAccount = `
import MetadataViews from 0xMetadataViews
import NFTCatalog from 0xNFTCatalog
import NFTRetrieval from 0xNFTRetrieval

pub struct COLLECTION {
    pub let count : UInt64
    pub let storagePath : StoragePath
    pub let publicPath : PublicPath
    pub let privatePath: PrivatePath
    pub let publicLinkedType: Type
    pub let privateLinkedType: Type
    pub let collectionName : String
    pub let collectionDescription: String
    pub let collectionSquareImage : String
    pub let collectionBannerImage : String
    init(
        count: UInt64,
        storagePath : StoragePath,
        publicPath : PublicPath,
        privatePath : PrivatePath,
        publicLinkedType : Type,
        privateLinkedType : Type,
        collectionName : String,
        collectionDescription : String,
        collectionSquareImage : String,
        collectionBannerImage : String
    ) {
        self.count = count
        self.storagePath = storagePath
        self.publicPath = publicPath
        self.privatePath = privatePath
        self.publicLinkedType = publicLinkedType
        self.privateLinkedType = privateLinkedType
        self.collectionName = collectionName
        self.collectionDescription = collectionDescription
        self.collectionSquareImage = collectionSquareImage
        self.collectionBannerImage = collectionBannerImage
    }
}

pub fun main(ownerAddress: Address) : {String : [COLLECTION]} {
    let catalog = NFTCatalog.getCatalog()
    let account = getAuthAccount(ownerAddress)
    let items : {String : [COLLECTION]} = {}
    for key in catalog.keys {
        let value = catalog[key]!
        let tempPathStr = "catalog".concat(key)
        let tempPublicPath = PublicPath(identifier: tempPathStr)!
        account.link<&{MetadataViews.ResolverCollection}>(
            tempPublicPath,
            target: value.collectionData.storagePath
        )
        let collectionCap = account.getCapability<&AnyResource{MetadataViews.ResolverCollection}>(tempPublicPath)
        if !collectionCap.check() {
            continue
        }
        let count = NFTRetrieval.getNFTCountFromCap(collectionIdentifier : key, collectionCap : collectionCap)
        if count != 0 {
            let collectionWithMetadata = NFTCatalog.getCatalogEntry(collectionIdentifier: key)
            items[key].append(COLLECTION(
                count: count,
                storagePath : collectionWithMetadata.collectionData!.storagePath,
                publicPath : collectionWithMetadata.collectionData!.publicPath,
                privatePath : collectionWithMetadata.collectionData!.providerPath,
                publicLinkedType : collectionWithMetadata.collectionData!.publicLinkedType,
                privateLinkedType : collectionWithMetadata.collectionData!.providerLinkedType,
                collectionName : collectionWithMetadata.collectionDisplay!.name,
                collectionDescription : collectionWithMetadata.collectionDisplay!.description,
                collectionSquareImage : collectionWithMetadata.collectionDisplay!.squareImage.file.uri(),
                collectionBannerImage : collectionWithMetadata.collectionDisplay!.bannerImage.file.uri()
            ))
        }
    }
    return items
}
`;