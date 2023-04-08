export const getCollectionsForAccount = `
import MetadataViews from 0xMetadataViews
import NFTCatalog from 0xNFTCatalog
import NFTRetrieval from 0xNFTRetrieval
pub fun main(ownerAddress: Address) : {String : Number} {
    let catalog = NFTCatalog.getCatalog()
    let account = getAuthAccount(ownerAddress)
    let items : {String : Number} = {}
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
            items[key] = count
        }
    }
    return items
}
`;