import { config } from "@onflow/fcl";
import * as fcl from "@onflow/fcl"
import {send as httpSend} from "@onflow/transport-http"

// testnet
config({
  "accessNode.api": "https://access-testnet.onflow.org",
  "discovery.wallet": "https://staging.accounts.meetdapper.com/fcl/authn-restricted",
  'discovery.wallet.method': "POP/RPC",
  'app.detail.title': "Asset Handover",
	'app.detail.icon': ""
})
// Configure SDK to use HTTP
fcl
  .config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("sdk.transport", httpSend)