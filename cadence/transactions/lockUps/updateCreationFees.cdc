import AssetHandover from "../../contracts/AssetHandover.cdc"

transaction(fees: UFix64) {
    prepare(account: AuthAccount) {
        let admin = account.getCapability(
            AssetHandover.AdminPrivatePath
        ).borrow<&AssetHandover.Admin>()
        ?? panic("Could not borrow AssetHandover.Admin reference.")

        admin.updateCreationFees(fees: fees)
    }
}
