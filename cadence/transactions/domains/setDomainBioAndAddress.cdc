import Domains from "../../contracts/nfts/Domains.cdc"

transaction(address: Address, bio: String, domainID: UInt64) {
    prepare(account: AuthAccount) {
        let collectionRef = account.getCapability(
            Domains.DomainsPrivatePath
        ).borrow<&Domains.Collection>()
        ?? panic("Could not borrow Collection reference")

        let domain = collectionRef.borrowDomainPrivate(id: domainID)
        domain.setAddress(addr: address)
        domain.setBio(bio: bio)
    }
}
