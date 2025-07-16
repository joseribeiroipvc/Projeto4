'use strict';

const { Contract } = require('fabric-contract-api');

class BPMNContract extends Contract {

  constructor() {
    super();
  }

  async createOrg1(ctx) {
    try {
      console.log('DEBUG: Iniciando createOrg1');
      const timestamp = ctx.stub.getTxTimestamp();
      const timestampStr = timestamp.seconds.toString();
      
      const participant = {
        id: 'Participant_Org1_' + timestampStr,
        name: 'Org1',
        docType: 'participant',
        tipo: 'organizacao',
        dataCriacao: new Date(timestamp.seconds.low * 1000).toISOString()
      };
      
      console.log('DEBUG: Participante criado:', JSON.stringify(participant));
      await ctx.stub.putState(participant.id, Buffer.from(JSON.stringify(participant)));
      console.log('DEBUG: Participante salvo com ID:', participant.id);
      
      return participant;
    } catch (error) {
      console.error('ERRO em createOrg1:', error);
      throw new Error(`Falha ao criar participante: ${error.message}`);
    }
  }

  async createOrg2(ctx) {
    try {
      console.log('DEBUG: Iniciando createOrg2');
      const timestamp = ctx.stub.getTxTimestamp();
      const timestampStr = timestamp.seconds.toString();
      
      const participant = {
        id: 'Participant_Org2_' + timestampStr,
        name: 'Org 2',
        docType: 'participant',
        tipo: 'organizacao',
        dataCriacao: new Date(timestamp.seconds.low * 1000).toISOString()
      };
      
      console.log('DEBUG: Participante criado:', JSON.stringify(participant));
      await ctx.stub.putState(participant.id, Buffer.from(JSON.stringify(participant)));
      console.log('DEBUG: Participante salvo com ID:', participant.id);
      
      return participant;
    } catch (error) {
      console.error('ERRO em createOrg2:', error);
      throw new Error(`Falha ao criar participante: ${error.message}`);
    }
  }

  async createFornecedor(ctx) {
    try {
      console.log('DEBUG: Iniciando createFornecedor');
      const timestamp = ctx.stub.getTxTimestamp();
      const timestampStr = timestamp.seconds.toString();
      
      const participant = {
        id: 'Participant_Fornecedor_' + timestampStr,
        name: 'Fornecedor',
        docType: 'participant',
        tipo: 'fornecedor',
        dataCriacao: new Date(timestamp.seconds.low * 1000).toISOString()
      };
      
      console.log('DEBUG: Participante criado:', JSON.stringify(participant));
      await ctx.stub.putState(participant.id, Buffer.from(JSON.stringify(participant)));
      console.log('DEBUG: Participante salvo com ID:', participant.id);
      
      return participant;
    } catch (error) {
      console.error('ERRO em createFornecedor:', error);
      throw new Error(`Falha ao criar participante: ${error.message}`);
    }
  }

  async getAllParticipants(ctx) {
    try {
      console.log('DEBUG: Iniciando getAllParticipants');
      const allResults = [];
      
      console.log('DEBUG: Iniciando getStateByRange');
      const iterator = await ctx.stub.getStateByRange('', '');
      console.log('DEBUG: Iterator criado');
      
      try {
        let count = 0;
        while (true) {
          console.log('DEBUG: Iteração', count++);
          const res = await iterator.next();
          
          if (res.done) {
            console.log('DEBUG: Iterator finalizado após', count, 'iterações');
            break;
          }
          
          if (res.value && res.value.value) {
            console.log('DEBUG: Valor encontrado:', res.value.key);
            try {
              const strValue = res.value.value.toString('utf8');
              console.log('DEBUG: Valor como string:', strValue);
              
              const record = JSON.parse(strValue);
              console.log('DEBUG: Registro parseado:', JSON.stringify(record));
              
              if (record.docType === 'participant') {
                console.log('DEBUG: Participante encontrado:', JSON.stringify(record));
                allResults.push(record);
              } else {
                console.log('DEBUG: Registro não é participante, docType:', record.docType);
              }
            } catch (err) {
              console.error('Erro ao processar registro:', err);
            }
          }
        }
      } finally {
        console.log('DEBUG: Fechando iterator');
        await iterator.close();
      }
      
      console.log('DEBUG: Total de participantes encontrados:', allResults.length);
      return JSON.stringify(allResults);
      
    } catch (error) {
      console.error('ERRO em getAllParticipants:', error);
      throw new Error(`Falha ao buscar participantes: ${error.message}`);
    }
  }

  async InitLedger(ctx) {
    console.log('DEBUG: Iniciando InitLedger');
    
    try {
      console.log('DEBUG: Criando Org1 inicial');
      const org1 = await this.createOrg1(ctx);
      console.log('DEBUG: Org1 criado:', org1);

      console.log('DEBUG: Criando Org 2 inicial');
      const org2 = await this.createOrg2(ctx);
      console.log('DEBUG: Org 2 criado:', org2);

      console.log('DEBUG: Criando Fornecedor inicial');
      const fornecedor = await this.createFornecedor(ctx);
      console.log('DEBUG: Fornecedor criado:', fornecedor);

      console.log('DEBUG: Buscando todos os participantes');
      const participantes = await this.getAllParticipants(ctx);
      console.log('DEBUG: Participantes encontrados:', participantes);
      
      console.log('DEBUG: Inicializando datastore batata');
      const batataInfo = await this.initBatataDatastore(ctx);
      console.log('DEBUG: Datastore batata inicializado:', batataInfo);

      console.log('DEBUG: Ledger inicializado com sucesso');
      return participantes;
    } catch (error) {
      console.error('ERRO em InitLedger:', error);
      throw new Error(`Falha ao inicializar ledger: ${error.message}`);
    }
  }

  async initBatataDatastore(ctx) {
    try {
      console.log('DEBUG: Inicializando datastore batata');
      const timestamp = ctx.stub.getTxTimestamp();
      
      const datastoreInfo = {
        id: 'DataStoreReference_0vbeb7c',
        name: 'batata',
        docType: 'datastoreInfo',
        tipo: 'datastore',
        inicializado: true,
        dataInicializacao: new Date(timestamp.seconds.low * 1000).toISOString(),
        totalRegistos: 0
      };
      
      console.log('DEBUG: Datastore info criado:', JSON.stringify(datastoreInfo));
      await ctx.stub.putState('DataStoreReference_0vbeb7c_INFO', Buffer.from(JSON.stringify(datastoreInfo)));
      
      return datastoreInfo;
    } catch (error) {
      console.error('ERRO em initBatataDatastore:', error);
      throw new Error(`Falha ao inicializar datastore batata: ${error.message}`);
    }
  }

  async getBatataInfo(ctx) {
    try {
      console.log('DEBUG: Obtendo informações do datastore batata');
      
      const datastoreInfoBytes = await ctx.stub.getState('DataStoreReference_0vbeb7c_INFO');
      let datastoreInfo;
      
      if (!datastoreInfoBytes || datastoreInfoBytes.length === 0) {
        // Se não existir, inicializar automaticamente
        datastoreInfo = await this.initBatataDatastore(ctx);
      } else {
        datastoreInfo = JSON.parse(datastoreInfoBytes.toString());
      }
      
      // Calcular o total real de Registos no ledger
      console.log('DEBUG: Calculando total real de Registos do datastore batata...');
      let totalRegistos = 0;
      
      const iterator = await ctx.stub.getStateByRange('', '');
      try {
        while (true) {
          const res = await iterator.next();
          
          if (res.done) {
            break;
          }
          
          if (res.value && res.value.value) {
            try {
              const strValue = res.value.value.toString('utf8');
              const record = JSON.parse(strValue);
              
              // Filtrar Registos baseado no tipo do datastore
              if (record.datastoreId === 'DataStoreReference_0vbeb7c' || record.docType === 'batata') {
                totalRegistos++;
              }
            } catch (err) {
              console.error('Erro ao processar registro para contagem:', err);
            }
          }
        }
      } finally {
        await iterator.close();
      }
      
      // Atualizar o totalRegistos com o valor real
      datastoreInfo.totalRegistos = totalRegistos;
      datastoreInfo.ultimaVerificacao = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
      
      console.log('DEBUG: Total real de Registos encontrados no datastore batata:', totalRegistos);
      console.log('DEBUG: Informações do datastore atualizadas:', JSON.stringify(datastoreInfo));
      
      // Salvar informações atualizadas
      await ctx.stub.putState('DataStoreReference_0vbeb7c_INFO', Buffer.from(JSON.stringify(datastoreInfo)));
      
      return datastoreInfo;
    } catch (error) {
      console.error('ERRO em getBatataInfo:', error);
      throw new Error(`Falha ao obter informações do datastore batata: ${error.message}`);
    }
  }

  async getAllBatata(ctx) {
    try {
      console.log('DEBUG: Listando todos os Registos do datastore batata');
      const allResults = [];
      
      const iterator = await ctx.stub.getStateByRange('', '');
      
      try {
        while (true) {
          const res = await iterator.next();
          
          if (res.done) {
            break;
          }
          
          if (res.value && res.value.value) {
            try {
              const strValue = res.value.value.toString('utf8');
              const record = JSON.parse(strValue);
              
              // Filtrar Registos baseado no tipo do datastore
              if (record.datastoreId === 'DataStoreReference_0vbeb7c' || record.docType === 'batata') {
                allResults.push(record);
              }
            } catch (err) {
              console.error('Erro ao processar registro:', err);
            }
          }
        }
      } finally {
        await iterator.close();
      }
      
      console.log('DEBUG: Total de Registos encontrados no datastore batata:', allResults.length);
      return JSON.stringify(allResults);
      
    } catch (error) {
      console.error('ERRO em getAllBatata:', error);
      throw new Error(`Falha ao listar Registos do datastore batata: ${error.message}`);
    }
  }

  async CriarEncomenda(ctx, pedidoEncomendaId) {
    try {
      console.log('DEBUG: Iniciando CriarEncomenda');
      const timestamp = ctx.stub.getTxTimestamp();
      const timestampStr = timestamp.seconds.toString();

      const pedidoEncomendaBytes = await ctx.stub.getState(pedidoEncomendaId);
      if (!pedidoEncomendaBytes || pedidoEncomendaBytes.length === 0) {
        throw new Error(`Pedido de encomenda ${pedidoEncomendaId} não encontrado`);
      }
      const pedidoEncomenda = JSON.parse(pedidoEncomendaBytes.toString());

      const encomenda = {
        id: 'Encomenda_' + timestampStr,
        docType: 'encomenda',
        pedidoEncomendaId: pedidoEncomendaId,
        clienteId: pedidoEncomenda.participantId,
        processadoPorId: 'Participant_Org1_' + timestampStr,
        fornecedorId: 'Participant_Fornecedor_' + timestampStr,
        estado: 'CRIADA',
        produtos: pedidoEncomenda.produtos,
        detalhesEntrega: pedidoEncomenda.detalhesEntrega,
        dataCriacao: new Date(timestamp.seconds.low * 1000).toISOString()
      };
      console.log('DEBUG: Encomenda criada:', JSON.stringify(encomenda));

      pedidoEncomenda.estado = 'PROCESSADO';
      await ctx.stub.putState(pedidoEncomendaId, Buffer.from(JSON.stringify(pedidoEncomenda)));

      console.log('DEBUG: Tentando salvar encomenda no ledger com ID:', encomenda.id);
      await ctx.stub.putState(encomenda.id, Buffer.from(JSON.stringify(encomenda)));
      console.log('DEBUG: Encomenda salva com sucesso no ledger!');
      
      return encomenda;
    } catch (error) {
      console.error('ERRO em CriarEncomenda:', error);
      throw new Error(`Falha ao criar encomenda: ${error.message}`);
    }
  }

  async CriarPedidoEncomenda(ctx, produtos, detalhesEntrega) {
    try {
      console.log('DEBUG: Iniciando CriarPedidoEncomenda');
      const timestamp = ctx.stub.getTxTimestamp();
      const timestampStr = timestamp.seconds.toString();

      const pedidoEncomenda = {
        id: 'PedidoEncomenda_' + timestampStr,
        docType: 'pedidoEncomenda',
        participantId: 'Participant_Org2_' + timestampStr,
        estado: 'PENDENTE',
        produtos: produtos || [],
        detalhesEntrega: detalhesEntrega || {},
        dataCriacao: new Date(timestamp.seconds.low * 1000).toISOString()
      };
      console.log('DEBUG: Pedido de Encomenda criado:', JSON.stringify(pedidoEncomenda));

      await ctx.stub.putState(pedidoEncomenda.id, Buffer.from(JSON.stringify(pedidoEncomenda)));
      return pedidoEncomenda;
    } catch (error) {
      console.error('ERRO em CriarPedidoEncomenda:', error);
      throw new Error(`Falha ao criar pedido de encomenda: ${error.message}`);
    }
  }

  // Método auxiliar para incrementar contador do datastore
  async incrementDatastoreCount(ctx, datastoreId) {
    try {
      if (!datastoreId) return;
      
      const infoKey = datastoreId + '_INFO';
      const datastoreInfoBytes = await ctx.stub.getState(infoKey);
      
      if (datastoreInfoBytes && datastoreInfoBytes.length > 0) {
        const datastoreInfo = JSON.parse(datastoreInfoBytes.toString());
        datastoreInfo.totalRegistos = (datastoreInfo.totalRegistos || 0) + 1;
        datastoreInfo.ultimaAtualizacao = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        
        await ctx.stub.putState(infoKey, Buffer.from(JSON.stringify(datastoreInfo)));
        console.log('DEBUG: Contador do datastore', datastoreId, 'incrementado para', datastoreInfo.totalRegistos);
      }
    } catch (error) {
      console.error('ERRO ao incrementar contador do datastore:', error);
    }
  }

}

module.exports = BPMNContract;
