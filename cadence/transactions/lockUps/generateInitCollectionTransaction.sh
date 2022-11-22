#!/usr/bin/env bash

IFS='.'

read -a identifier <<< $1
contract_address=${identifier[1]}
contract_name=${identifier[2]}
echo $contract_name
echo $contract_address

transaction=$(sed "s/CONTRACT_NAME/$contract_name/; s/CONTRACT_ADDRESS/$contract_address/; s/PUBLIC_TYPE/${2}/; s/PRIVATE_TYPE/${3}/;" ./cadence/transactions/lockUps/initCollectionTemplate.cdc > ./cadence/transactions/lockUps/initCollection.cdc)
echo $transaction
