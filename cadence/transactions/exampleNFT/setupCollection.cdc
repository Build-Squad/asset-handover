import NonFungibleToken from "../../contracts/interfaces/NonFungibleToken.cdc"
import MetadataViews from "../../contracts/utility/MetadataViews.cdc"
import ExampleNFT from "../../contracts/nfts/ExampleNFT.cdc"

transaction {

    prepare(account: AuthAccount) {
        // Create a new empty collection
        let collection <- ExampleNFT.createEmptyCollection()

        // save it to the account
        account.save(<-collection, to: /storage/exampleNFTCollection)

        // create a public capability for the collection
        account.link<&ExampleNFT.Collection{ExampleNFT.ExampleNFTCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Receiver,MetadataViews.ResolverCollection}>(
            /public/exampleNFTCollection,
            target: /storage/exampleNFTCollection
        )

        // create a private capability for the collection
        account.link<&ExampleNFT.Collection>(
            /private/exampleNFTCollection,
            target: /storage/exampleNFTCollection
        )
    }
}
