import { config } from "@onflow/fcl";

// testnet
config({
  "accessNode.api": process.env.REACT_APP_ACCESSNODE_API,
  "flow.network": process.env.REACT_APP_FLOW_NETWORK,
  "discovery.wallet.method": process.env.REACT_APP_DISCOVERY_WALLET_METHOD,
  "discovery.wallet": process.env.REACT_APP_DISCOVERY_WALLET,
  // Lilico and Flipper and the rest work only with RPC, if we want to enable them
  // we have to use the following:
  // "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  // "discovery.authn.endpoint": "https://fcl-discovery.onflow.org/api/testnet/authn",
  // "discovery.authn.include": ["0x82ec283f88a62e65", "0x9d2e44203cb13051"], // Service account address
  'app.detail.title': process.env.REACT_APP_APP_DETAIL_TITLE,
  'app.detail.icon': process.env.REACT_APP_APP_DETAIL_ICON,
  "0xAssetHandover": process.env.REACT_APP_0XASSETHANDOVER,
  "0xFT": process.env.REACT_APP_0XFT,
  "0xNFT": process.env.REACT_APP_0XNFT,
  "0xFlowToken": process.env.REACT_APP_0XFLOWTOKEN,
  "0xMetadataViews": process.env.REACT_APP_0XMETADATAVIEWS,
  "0xNFTCatalog": process.env.REACT_APP_0XNFTCATALOG,
  "0xNFTRetrieval": process.env.REACT_APP_0XNFTRETRIEVAL,
})