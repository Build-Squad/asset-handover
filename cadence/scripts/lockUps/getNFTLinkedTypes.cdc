import AssetHandover from "../../contracts/AssetHandover.cdc"

pub fun main(identifier: String): {String: String} {
    let nftInfo = AssetHandover.getNonFungibleTokenInfoMapping()[identifier]

    if nftInfo == nil {
        return {}
    }

    let linkedTypes: {String: String} = {}
    linkedTypes["publicType"] = nftInfo!.publicType.identifier
    linkedTypes["privateType"] = nftInfo!.privateType.identifier

    return linkedTypes
}
