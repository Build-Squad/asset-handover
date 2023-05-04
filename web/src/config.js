import { config } from "@onflow/fcl";

// testnet
config({
  "accessNode.api": "https://rest-testnet.onflow.org",
  "flow.network": "testnet",
  "discovery.wallet.method": "HTTP/POST",
  "discovery.wallet": "https://flow-wallet-testnet.blocto.app/api/flow/authn",
  // Lilico and Flipper and the rest work only with RPC, if we want to enable them
  // we have to use the following:
    // "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  // "discovery.authn.endpoint": "https://fcl-discovery.onflow.org/api/testnet/authn",
  // "discovery.authn.include": ["0x82ec283f88a62e65", "0x9d2e44203cb13051"], // Service account address
  'app.detail.title': "Asset Handover",
	'app.detail.icon': "",
  "0xAssetHandover": "0x5d649d473cc7fa83",
  "0xFT": "0x9a0766d93b6608b7",
  "0xNFT": "0x631e88ae7f1d7c20",
  "0xFlowToken": "0x7e60df042a9c0868",
  "0xMetadataViews": "0x631e88ae7f1d7c20",
  "0xNFTCatalog": "0x324c34e1c517e4db",
  "0xNFTRetrieval": "0x324c34e1c517e4db",
})