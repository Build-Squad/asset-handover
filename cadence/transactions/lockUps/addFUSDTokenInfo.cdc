import AssetHandover from "../../contracts/AssetHandover.cdc"
import FUSD from "../../contracts/tokens/FUSD.cdc"

transaction {
    let admin: &AssetHandover.Admin

    prepare(account: AuthAccount) {
        self.admin = account.getCapability(
            AssetHandover.AdminPrivatePath
        ).borrow<&AssetHandover.Admin>()
        ?? panic("Could not borrow AssetHandover.Admin reference.")
    }

    execute {
        var identifier = Type<FUSD>().identifier
        var fungibleTokenInfo = AssetHandover.FungibleTokenInfo(
            name: "FUSD",
            receiverPath: /public/fusdReceiver,
            balancePath: /public/fusdBalance,
            privatePath: /private/fusdVault,
            storagePath: /storage/fusdVault
        )
        self.admin.addFungibleTokenInfo(identifier: identifier, tokenInfo: fungibleTokenInfo)
    }
}
