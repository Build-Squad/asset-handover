import AssetHandover from "../../contracts/AssetHandover.cdc"
import FungibleToken from "../../contracts/interfaces/FungibleToken.cdc"

transaction(identifier: String) {
    prepare(account: AuthAccount) {
        let info = AssetHandover.getFungibleTokenInfoMapping()[identifier]!
        let lockUp = account
            .getCapability(AssetHandover.LockUpPrivatePath)
            .borrow<&AssetHandover.LockUp{AssetHandover.LockUpPrivate}>()
            ?? panic("Could not borrow AssetHandover.LockUpPrivate reference.")

        account.link<&FungibleToken.Vault>(info.privatePath, target: info.storagePath)
        let vault = account.getCapability<&FungibleToken.Vault>(
            info.privatePath
        )

        lockUp.lockFT(
            identifier: identifier,
            vault: vault,
            balance: nil
        )
    }
}
