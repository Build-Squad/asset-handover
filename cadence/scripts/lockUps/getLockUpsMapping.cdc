import AssetHandover from "../../contracts/AssetHandover.cdc"

pub fun main(): {Address: [Address]} {
    return AssetHandover.lockUpsMapping
}
