import FungibleToken from "../../contracts/interfaces/FungibleToken.cdc"
import FlowToken from "../../contracts/tokens/FlowToken.cdc"
import BlpToken from "../../contracts/tokens/BlpToken.cdc"
import Domains from "../../contracts/nfts/Domains.cdc"

pub fun main(): String {
    return Type<Domains>().identifier
}
