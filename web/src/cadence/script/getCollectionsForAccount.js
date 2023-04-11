export const getCollectionsForAccount = `
import MetadataViews from 0xMetadataViews
import NFTCatalog from 0xNFTCatalog
import NFTRetrieval from 0xNFTRetrieval

pub struct NFTCollection {
    pub let contractName: String
    pub let contractAddress: String
    pub let storagePath : StoragePath
    pub let publicPath : PublicPath
    pub let privatePath: PrivatePath
    pub let publicLinkedType: Type
    pub let privateLinkedType: Type
    pub let collectionName : String
    pub let collectionDescription: String
    pub let collectionSquareImage : String
    pub let collectionBannerImage : String
    pub let collectionIdentifier: String
    pub let nftsCount: UInt64
    init(
        contractName: String,
        contractAddress: String,
        storagePath : StoragePath,
        publicPath : PublicPath,
        privatePath : PrivatePath,
        publicLinkedType : Type,
        privateLinkedType : Type,
        collectionName : String,
        collectionDescription : String,
        collectionSquareImage : String,
        collectionBannerImage : String,
        collectionIdentifier: String,
        nftsCount: UInt64
    ) {
        self.contractName = contractName
        self.contractAddress = contractAddress
        self.storagePath = storagePath
        self.publicPath = publicPath
        self.privatePath = privatePath
        self.publicLinkedType = publicLinkedType
        self.privateLinkedType = privateLinkedType
        self.collectionName = collectionName
        self.collectionDescription = collectionDescription
        self.collectionSquareImage = collectionSquareImage
        self.collectionBannerImage = collectionBannerImage
        self.collectionIdentifier = collectionIdentifier
        self.nftsCount = nftsCount
    }
}

<<<<<<< HEAD
pub fun main(ownerAddress: Address) : {String : [NFTCollection]} {
    let catalog = NFTCatalog.getCatalog()
    let account = getAuthAccount(ownerAddress)
    let items : {String : [NFTCollection]} = {}
=======
pub fun main(ownerAddress: Address) : [NFTCollection] {
    let catalog = NFTCatalog.getCatalog()
    let account = getAuthAccount(ownerAddress)
    let collectionsData : [NFTCollection] = []
>>>>>>> 88fa60fa7e6162be96ec98f2998f0f84c395eb36
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
<<<<<<< HEAD
=======
        let valueIdent = NFTCatalog.getCatalogEntry(collectionIdentifier: key)!
>>>>>>> 88fa60fa7e6162be96ec98f2998f0f84c395eb36
        let contractView = catalog[key]!
        let collectionDataView = catalog[key]!.collectionData
        let collectionDisplayView = catalog[key]!.collectionDisplay

<<<<<<< HEAD
        items[key]?.append(
=======
        collectionsData.append(
>>>>>>> 88fa60fa7e6162be96ec98f2998f0f84c395eb36
            NFTCollection(
                contractName: contractView.contractName,
                contractAddress: contractView.contractAddress.toString(),
                storagePath : collectionDataView!.storagePath,
                publicPath : collectionDataView!.publicPath,
                privatePath : collectionDataView!.privatePath,
                publicLinkedType : collectionDataView!.publicLinkedType,
                privateLinkedType : collectionDataView!.privateLinkedType,
                collectionName : collectionDisplayView!.name,
                collectionDescription : collectionDisplayView!.description,
                collectionSquareImage : collectionDisplayView!.squareImage.file.uri(),
                collectionBannerImage : collectionDisplayView!.bannerImage.file.uri(),
<<<<<<< HEAD
                collectionIdentifier : key,
                nftsCount: count
            )
        )
    }
    return items
=======
                collectionIdentifier : valueIdent.nftType.identifier,
                nftsCount: count
              )
          )
      }

    return collectionsData
>>>>>>> 88fa60fa7e6162be96ec98f2998f0f84c395eb36
}
`;