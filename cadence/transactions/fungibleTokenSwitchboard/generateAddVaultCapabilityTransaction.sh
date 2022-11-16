#!/usr/bin/env bash

IFS='.'
read -a parts <<< $1
contract_address=${parts[1]}
contract_name=${parts[2]}
echo $contract_name
echo $contract_address
transaction=$(sed "s/CONTRACT_NAME/$contract_name/; s/CONTRACT_ADDRESS/$contract_address/" ./cadence/transactions/fungibleTokenSwitchboard/addVaultCapabilityTemplate.cdc >> ./cadence/transactions/fungibleTokenSwitchboard/addVaultCapability.cdc)
echo $transaction
