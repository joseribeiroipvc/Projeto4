'use strict';

const { Contract } = require('fabric-contract-api');
const OrderOperations = require('./operations/OrderOperations');
const InvoiceOperations = require('./operations/InvoiceOperations');

class BPMNContract extends Contract {

  constructor() {
    super('BPMNContract');
    this.orderOps = new OrderOperations();
    this.invoiceOps = new InvoiceOperations();
  }

  async createFornecedor(ctx) {
    try {
      console.log('DEBUG: Iniciando createFornecedor');
      
      // Obter timestamp da transação
      const timestamp = ctx.stub.getTxTimestamp();
      const timestampStr = timestamp.seconds.toString();
      
      const participant = {
        id: 'Participant_Fornecedor_' + timestampStr,
        name: 'Fornecedor',
        docType: 'participant',
        tipo: 'fornecedor',
        dataCriacao: new Date(timestamp.seconds * 1000).toISOString()
      };
      console.log('DEBUG: Participante criado:', JSON.stringify(participant));
      
      // Salva o participante
      await ctx.stub.putState(participant.id, Buffer.from(JSON.stringify(participant)));
      console.log('DEBUG: Participante salvo com ID:', participant.id);
      
      return JSON.stringify(participant);
    } catch (error) {
      console.error('ERRO em createFornecedor:', error);
      throw new Error(`Falha ao criar fornecedor: ${error.message}`);
    }
  }

  async createOrg2(ctx) {
    try {
      console.log('DEBUG: Iniciando createOrg2');
      
      // Obter timestamp da transação
      const timestamp = ctx.stub.getTxTimestamp();
      const timestampStr = timestamp.seconds.toString();
      
      const participant = {
        id: 'Participant_Org2_' + timestampStr,
        name: 'Org 2',
        docType: 'participant',
        tipo: 'organizacao',
        dataCriacao: new Date(timestamp.seconds * 1000).toISOString()
      };
      console.log('DEBUG: Participante criado:', JSON.stringify(participant));
      
      // Salva o participante
      await ctx.stub.putState(participant.id, Buffer.from(JSON.stringify(participant)));
      console.log('DEBUG: Participante salvo com ID:', participant.id);
      
      return JSON.stringify(participant);
    } catch (error) {
      console.error('ERRO em createOrg2:', error);
      throw new Error(`Falha ao criar Org2: ${error.message}`);
    }
  }

  async createOrg1(ctx) {
    try {
      console.log('DEBUG: Iniciando createOrg1');
      
      // Obter timestamp da transação
      const timestamp = ctx.stub.getTxTimestamp();
      const timestampStr = timestamp.seconds.toString();
      
      const participant = {
        id: 'Participant_Org1_' + timestampStr,
        name: 'Org 1',
        docType: 'participant',
        tipo: 'organizacao',
        dataCriacao: new Date(timestamp.seconds * 1000).toISOString()
      };
      console.log('DEBUG: Participante criado:', JSON.stringify(participant));
      
      // Salva o participante
      await ctx.stub.putState(participant.id, Buffer.from(JSON.stringify(participant)));
      console.log('DEBUG: Participante salvo com ID:', participant.id);
      
      return JSON.stringify(participant);
    } catch (error) {
      console.error('ERRO em createOrg1:', error);
      throw new Error(`Falha ao criar Org1: ${error.message}`);
    }
  }

  async createfaturas(ctx) {
    const asset = {
      id: 'DataStoreReference_0yt20xj',
      name: 'faturas'
    };
    await ctx.stub.putState('DataStoreReference_0yt20xj', Buffer.from(JSON.stringify(asset)));
    return JSON.stringify(asset);
  }

  async createencomendas(ctx) {
    const asset = {
      id: 'DataStoreReference_1ynha5w',
      name: 'encomendas'
    };
    await ctx.stub.putState('DataStoreReference_1ynha5w', Buffer.from(JSON.stringify(asset)));
    return JSON.stringify(asset);
  }

  // ==================== ORDER OPERATIONS ====================
  async CriarEncomenda(ctx) {
    return await this.orderOps.CriarEncomenda(ctx);
  }

  async ListarEncomendas(ctx) {
    return await this.orderOps.ListarEncomendas(ctx);
  }

  // ==================== INVOICE OPERATIONS ====================
  async CriarFatura(ctx, encomendaId) {
    return await this.invoiceOps.CriarFatura(ctx, encomendaId);
  }

  async ListarFaturas(ctx) {
    return await this.invoiceOps.ListarFaturas(ctx);
  }

  // ==================== PARTICIPANT OPERATIONS ====================
  async getAllParticipants(ctx) {
    try {
      console.log('DEBUG: Iniciando getAllParticipants');
      const allResults = [];
      
      // Usar getStateByRange para buscar todos os registros
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
              // Converter o buffer para string e depois para objeto
              const strValue = res.value.value.toString('utf8');
              console.log('DEBUG: Valor como string:', strValue);
              
              const record = JSON.parse(strValue);
              console.log('DEBUG: Registro parseado:', JSON.stringify(record));
              
              // Filtrar apenas os registros do tipo participant
              if (record.docType === 'participant') {
                console.log('DEBUG: Participante encontrado:', JSON.stringify(record));
                allResults.push(record);
              } else {
                console.log('DEBUG: Registro não é participante, docType:', record.docType);
              }
            } catch (err) {
              console.error('Erro ao processar registro:', err);
              console.error('Registro raw:', res.value.toString());
            }
          } else {
            console.log('DEBUG: Valor nulo ou indefinido encontrado');
          }
        }
      } finally {
        console.log('DEBUG: Fechando iterator');
        await iterator.close();
      }
      
      console.log('DEBUG: Total de participantes encontrados:', allResults.length);
      console.log('DEBUG: Lista de participantes:', JSON.stringify(allResults));
      
      return JSON.stringify(allResults);
      
    } catch (error) {
      console.error('ERRO em getAllParticipants:', error);
      throw new Error(`Falha ao buscar participantes: ${error.message}`);
    }
  }

  // Método para inicializar o ledger
  async InitLedger(ctx) {
    console.log('DEBUG: Iniciando InitLedger');
    
    try {
      // Usar os métodos existentes para criar os participantes
      console.log('DEBUG: Criando fornecedor inicial');
      const fornecedor = await this.createFornecedor(ctx);
      console.log('DEBUG: Fornecedor criado:', fornecedor);

      console.log('DEBUG: Criando Org1 inicial');
      const org1 = await this.createOrg1(ctx);
      console.log('DEBUG: Org1 criada:', org1);

      console.log('DEBUG: Criando Org2 inicial');
      const org2 = await this.createOrg2(ctx);
      console.log('DEBUG: Org2 criada:', org2);

      // Buscar todos os participantes criados
      console.log('DEBUG: Buscando todos os participantes');
      const participantes = await this.getAllParticipants(ctx);
      console.log('DEBUG: Participantes encontrados:', participantes);
      
      console.log('DEBUG: Ledger inicializado com sucesso');
      return participantes;
    } catch (error) {
      console.error('ERRO em InitLedger:', error);
      throw new Error(`Falha ao inicializar ledger: ${error.message}`);
    }
  }

}

module.exports = BPMNContract;