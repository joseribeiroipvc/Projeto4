#!/bin/bash

# Navegar até a pasta da rede de teste
cd fabric-samples/test-network

# Parar a rede existente
echo "Parando a rede existente..."
./network.sh down

# Iniciar a rede e criar o canal
echo "Iniciando a rede e criando o canal..."
./network.sh up createChannel -ca

# Deploy do smart contract
echo "Fazendo deploy do smart contract..."
./network.sh deployCC -ccn basic -ccp ../../SmartContractHyperledger -ccl javascript

echo "Deploy concluído!" 