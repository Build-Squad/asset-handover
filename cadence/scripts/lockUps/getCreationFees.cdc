import AssetHandover from "../../contracts/AssetHandover.cdc"

pub fun main(): UFix64 {
    return AssetHandover.getCreationFees()
}
