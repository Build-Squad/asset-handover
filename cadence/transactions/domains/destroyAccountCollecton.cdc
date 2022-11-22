import Domains from "../../contracts/nfts/Domains.cdc"
import NonFungibleToken from "../../contracts/interfaces/NonFungibleToken.cdc"

transaction() {
    prepare(account: AuthAccount) {
        let collection <- account.load<@NonFungibleToken.Collection>(
            from: Domains.DomainsStoragePath
        )
        destroy collection

        account.unlink(Domains.DomainsPublicPath)
        account.unlink(Domains.DomainsPrivatePath)
    }
}
