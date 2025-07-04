#!/bin/bash

# 🚀 SCRIPT AUTOMATIZADO - Deploy e Teste do Smart Contract BPMN
# Baseado no GUIA_COMPLETO_DEPLOY.md

set -e  # Parar se houver erro

echo "🚀 INICIANDO DEPLOY AUTOMATIZADO DO SMART CONTRACT BPMN"
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para verificar se comando foi executado com sucesso
check_status() {
    if [ $? -eq 0 ]; then
        log_success "$1"
    else
        log_error "$1"
        exit 1
    fi
}

# PASSO 1: Verificar se estamos no WSL (versão melhorada)
log_info "Verificando ambiente WSL..."
if [[ -f /proc/version ]] && grep -q Microsoft /proc/version; then
    log_success "WSL detectado"
elif [[ -f /proc/version ]] && grep -q WSL /proc/version; then
    log_success "WSL detectado"
elif [[ -f /proc/version ]] && grep -q microsoft /proc/version; then
    log_success "WSL detectado"
else
    log_warning "WSL não detectado automaticamente, mas continuando..."
    log_info "Se estiver no Windows PowerShell, pare e execute no WSL"
fi

# PASSO 2: Navegar para o diretório correto
log_info "Navegando para test-network..."
cd /mnt/c/Users/35191/IPVC/3ano/PROJ4/Projeto4/fabric-samples/test-network
check_status "Navegação para test-network"

# PASSO 3: Verificar se Docker está rodando
log_info "Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    log_error "Docker não está rodando! Inicie o Docker Desktop primeiro."
    exit 1
fi
log_success "Docker está rodando"

# PASSO 4: Parar rede existente (se houver)
log_info "Parando rede existente..."
./network.sh down  > /dev/null 2>&1 || true
log_success "Rede parada"

# PASSO 5: Iniciar rede com canal
log_info "Iniciando rede com canal..."
./network.sh up createChannel
check_status "Rede iniciada"

# PASSO 6: Configurar variáveis de ambiente ANTES de usar peer
log_info "Configurando variáveis de ambiente..."
source ./env.sh
check_status "Variáveis de ambiente configuradas"

# PASSO 7: Verificar se peer está disponível
log_info "Verificando se peer está disponível..."
if ! command -v peer &> /dev/null; then
    log_error "Comando 'peer' não encontrado após configurar ambiente!"
    log_info "Tentando configurar manualmente..."
    export PATH=${PWD}/bin:${PWD}/../bin:${PWD}/../../bin:${PWD}/../../../bin:${PWD}/../../../../bin:${PWD}/../../../../../bin:$PATH
    export FABRIC_CFG_PATH=$PWD/../config/
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
    export CORE_PEER_ADDRESS=localhost:7051
    export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
fi

if ! command -v peer &> /dev/null; then
    log_error "Comando 'peer' ainda não encontrado. Verifique se fabric-samples está instalado corretamente."
    exit 1
fi
log_success "Comando 'peer' disponível"

# PASSO 8: Package do chaincode
log_info "Fazendo package do chaincode..."
peer lifecycle chaincode package bpmn-contract.tar.gz \
  --path /mnt/c/Users/35191/IPVC/3ano/PROJ4/Projeto4/SmartContractHyperledger \
  --lang node \
  --label bpmn-contract_1.0
check_status "Package do chaincode criado"

# PASSO 9: Instalar chaincode em Org1
log_info "Instalando chaincode em Org1..."
peer lifecycle chaincode install bpmn-contract.tar.gz
check_status "Chaincode instalado em Org1"

# PASSO 10: Obter Package ID
log_info "Obtendo Package ID..."
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep "Package ID" | tail -1 | cut -d' ' -f3 | sed 's/,//')
if [ -z "$PACKAGE_ID" ]; then
    log_error "Não foi possível obter o Package ID"
    exit 1
fi
log_success "Package ID: $PACKAGE_ID"

# Após instalar em Org1
log_info "Verificando instalação do chaincode em Org1..."
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
INSTALLED1=$(peer lifecycle chaincode queryinstalled | grep "$PACKAGE_ID" || true)
if [ -z "$INSTALLED1" ]; then
  log_error "Chaincode NÃO está instalado em Org1!"
  exit 1
else
  log_success "Chaincode instalado em Org1: $PACKAGE_ID"
fi

# PASSO 11: Instalar chaincode em Org2
log_info "Instalando chaincode em Org2..."
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:9051

peer lifecycle chaincode install bpmn-contract.tar.gz
check_status "Chaincode instalado em Org2"

# Após instalar em Org2
log_info "Verificando instalação do chaincode em Org2..."
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051
INSTALLED2=$(peer lifecycle chaincode queryinstalled | grep "$PACKAGE_ID" || true)
if [ -z "$INSTALLED2" ]; then
  log_error "Chaincode NÃO está instalado em Org2!"
  exit 1
else
  log_success "Chaincode instalado em Org2: $PACKAGE_ID"
fi

# PASSO 12: Approve para Org1
log_info "Aprovando chaincode para Org1..."
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode approveformyorg \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
  --channelID mychannel \
  --name bpmn-contract \
  --version 1.0 \
  --package-id "$PACKAGE_ID" \
  --sequence 1 \
  --signature-policy "OR('Org1MSP.peer','Org2MSP.peer')"
check_status "Chaincode aprovado para Org1"

# PASSO 13: Approve para Org2
log_info "Aprovando chaincode para Org2..."
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:9051

peer lifecycle chaincode approveformyorg \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
  --channelID mychannel \
  --name bpmn-contract \
  --version 1.0 \
  --package-id "$PACKAGE_ID" \
  --sequence 1 \
  --signature-policy "OR('Org1MSP.peer','Org2MSP.peer')"
check_status "Chaincode aprovado para Org2"

# PASSO 14: Commit do chaincode
log_info "Fazendo commit do chaincode..."
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode commit \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
  --channelID mychannel \
  --name bpmn-contract \
  --version 1.0 \
  --sequence 1 \
  --signature-policy "OR('Org1MSP.peer','Org2MSP.peer')"
check_status "Chaincode commitado"

# PASSO 15: Diagnóstico robusto da ativação do chaincode
log_info "Verificando se o container do chaincode está ativo..."
CHAINCODE_NAME="bpmn-contract"
CHANNEL_NAME="mychannel"
CC_CONTAINER=$(docker ps --format '{{.Names}}' | grep dev-peer.*${CHAINCODE_NAME} || true)
if [ -z "$CC_CONTAINER" ]; then
  log_warning "Container do chaincode ainda não foi criado. Tentando ativar com uma query..."
  peer chaincode query -C $CHANNEL_NAME -n $CHAINCODE_NAME -c '{"function":"getAllParticipants","Args":[]}' || true
  sleep 5
  CC_CONTAINER=$(docker ps --format '{{.Names}}' | grep dev-peer.*${CHAINCODE_NAME} || true)
fi

if [ -n "$CC_CONTAINER" ]; then
  log_success "Container do chaincode está ativo: $CC_CONTAINER"
  log_info "Aguardando alguns segundos para garantir que o chaincode está pronto..."
  sleep 10
  for CC in $CC_CONTAINER; do
    log_info "Logs recentes do container: $CC"
    docker logs --tail 20 $CC
  done
else
  log_error "O container do chaincode NÃO está ativo após a query."
  log_info "Listando todos os containers:"
  docker ps -a
  log_info "Logs do peer para diagnóstico:"
  docker logs peer0.org1.example.com | tail -n 40
  exit 1
fi

# Executar testes dentro do container CLI para evitar problemas de DNS/hosts
log_info "Executando testes dentro do container CLI para evitar problemas de DNS/hosts..."

docker exec cli bash -c '
  export CORE_PEER_LOCALMSPID="Org1MSP"
  export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
  export CORE_PEER_ADDRESS=peer0.org1.example.com:7051
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

  echo "Teste 0: Inicializar Ledger (Criar Participantes Automaticamente)"
  peer chaincode invoke -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n bpmn-contract --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '\''{"function":"InitLedger","Args":[]}'\''
  sleep 5

  echo "Teste 1: Listar Todos os Participantes"
  peer chaincode query -C mychannel -n bpmn-contract -c '\''{"function":"getAllParticipants","Args":[]}'\''
'

# PASSO 17: Verificar status final
echo ""
echo "🔍 VERIFICAÇÃO FINAL"
echo "==================="

log_info "Verificando containers..."
docker ps | grep -E "(orderer|peer|bpmn-contract)" || log_warning "Alguns containers podem não estar visíveis"

log_info "Verificando chaincode instalado..."
peer lifecycle chaincode queryinstalled

echo ""
echo "🎉 DEPLOY COMPLETO COM SUCESSO!"
echo "==============================="
echo ""
echo "✅ Rede Hyperledger Fabric funcionando"
echo "✅ Smart contract deployado"
echo "✅ Testes executados com sucesso"
echo ""