import { config } from "@onflow/fcl";
import * as fcl from "@onflow/fcl"
import {send as httpSend} from "@onflow/transport-http"

// testnet
config({
  "accessNode.api": "https://access-testnet.onflow.org",
  "challenge.handshake": "https://flow-wallet-testnet.blocto.app/authn",
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