export const lockNonFungibleToken = `
import AssetHandover from 0xAssetHandover
import NonFungibleToken from 0xNFT

transaction(identifier: String, nftIDs: [UInt64]) {
    prepare(account: AuthAccount) {
        let info = AssetHandover.getNonFungibleTokenInfoMapping()[identifier]!
        let lockUp = account
            .getCapability(AssetHandover.LockUpPrivatePath)
            .borrow<&AssetHandover.LockUp{AssetHandover.LockUpPrivate}>()
            ?? panic("Could not borrow AssetHandover.LockUpPrivate reference.")

        account.link<&{NonFungibleToken.Receiver}>(info.privatePath, target: info.storagePath)
        let collection = account.getCapability<&NonFungibleToken.Collection>(
            info.privatePath
        )

        lockUp.lockNFT(
            identifier: identifier,
            collection: collection,
            nftIDs: nftIDs
        )
    }
}
`