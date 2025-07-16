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


  // ==================== ORDER OPERATIONS ====================


  async ListarEncomendas(ctx) {
    try {
      console.log('DEBUG: Iniciando ListarEncomendas');
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
              
              // Filtrar apenas os registros do tipo encomenda
              if (record.docType === 'encomenda') {
                console.log('DEBUG: Encomenda encontrada:', JSON.stringify(record));
                allResults.push(record);
              } else {
                console.log('DEBUG: Registro não é encomenda, docType:', record.docType);
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
      
      console.log('DEBUG: Total de encomendas encontradas:', allResults.length);
      console.log('DEBUG: Lista de encomendas:', JSON.stringify(allResults));
      
      return JSON.stringify(allResults);
      
    } catch (error) {
      console.error('ERRO em ListarEncomendas:', error);
      throw new Error(`Falha ao buscar encomendas: ${error.message}`);
    }
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




  

  async CriarPedidoEncomenda(ctx, produtos, detalhesEntrega) {
    try {
      console.log('DEBUG: Iniciando CriarPedidoEncomenda');
      // Obter timestamp da transação
      const timestamp = ctx.stub.getTxTimestamp();
      const timestampStr = timestamp.seconds.toString();

      const pedidoEncomenda = {
        id: 'PedidoEncomenda_' + timestampStr,
        docType: 'pedidoEncomenda',
        participantId: 'Participant_Org2_' + timestampStr,
        estado: 'PENDENTE',
        produtos: produtos || [],
        detalhesEntrega: detalhesEntrega || {},
        dataCriacao: new Date().toISOString()
      };
      console.log('DEBUG: Pedido de Encomenda criado:', JSON.stringify(pedidoEncomenda));

      // Salvar no ledger
      await ctx.stub.putState(pedidoEncomenda.id, Buffer.from(JSON.stringify(pedidoEncomenda)));
      return pedidoEncomenda;
    } catch (error) {
      console.error('ERRO em CriarPedidoEncomenda:', error);
      throw new Error(`Falha ao criar pedido de encomenda: ${error.message}`);
    }
  }


  async CriarEncomenda(ctx, pedidoEncomendaId) {
    try {
      console.log('DEBUG: Iniciando CriarEncomenda');

      // Obter timestamp da transação
      const timestamp = ctx.stub.getTxTimestamp();
      const timestampStr = timestamp.seconds.toString();

      // Recuperar o pedido de encomenda
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
        processadoPorId: 'Participant_Org1_' + timestampStr,  // ID da Org1 que processa
        fornecedorId: 'Participant_Fornecedor_' + timestampStr, // ID do fornecedor
        estado: 'CRIADA',
        produtos: pedidoEncomenda.produtos,
        detalhesEntrega: pedidoEncomenda.detalhesEntrega,
        dataCriacao: new Date().toISOString(),
      };
      console.log('DEBUG: Encomenda criada:', JSON.stringify(encomenda));

      // Atualiza o estado do pedido
      pedidoEncomenda.estado = 'PROCESSADO';
      await ctx.stub.putState(pedidoEncomendaId, Buffer.from(JSON.stringify(pedidoEncomenda)));

      // Salva a nova encomenda
      console.log('DEBUG: Tentando salvar encomenda no ledger com ID:', encomenda.id);
      await ctx.stub.putState(encomenda.id, Buffer.from(JSON.stringify(encomenda)));
      console.log('DEBUG: Encomenda salva com sucesso no ledger!');
      console.log('DEBUG: NOTA - Verificação será feita após commit da transação');
      
      return encomenda;
    } catch (error) {
      console.error('ERRO em CriarEncomenda:', error);
      throw new Error(`Falha ao criar encomenda: ${error.message}`);
    }
  }

  // ==================== INVOICE OPERATIONS ====================
  async CriarFatura(ctx, encomendaId) {
    try {
      console.log('DEBUG: Iniciando CriarFatura com encomendaId:', encomendaId);
      
      // Verificar se a encomenda existe
      const encomendaBytes = await ctx.stub.getState(encomendaId);
      if (!encomendaBytes || encomendaBytes.length === 0) {
        throw new Error(`Encomenda ${encomendaId} não encontrada`);
      }
      
      const encomenda = JSON.parse(encomendaBytes.toString());
      console.log('DEBUG: Encomenda encontrada:', JSON.stringify(encomenda));
      
      // Obter timestamp da transação
      const timestamp = ctx.stub.getTxTimestamp();
      const timestampStr = timestamp.seconds.toString();
      
      const fatura = {
        id: 'Fatura_' + timestampStr,
        docType: 'fatura',
        encomendaId: encomendaId,
        clienteId: encomenda.clienteId,
        fornecedorId: encomenda.fornecedorId,
        estado: 'CRIADA',
        valor: 100.00, // Valor exemplo
        dataCriacao: new Date().toISOString(),
        produtos: encomenda.produtos
      };
      
      console.log('DEBUG: Fatura criada:', JSON.stringify(fatura));
      
      // Salvar a fatura
      await ctx.stub.putState(fatura.id, Buffer.from(JSON.stringify(fatura)));
      return JSON.stringify(fatura);
      
    } catch (error) {
      console.error('ERRO em CriarFatura:', error);
      throw new Error(`Falha ao criar fatura: ${error.message}`);
    }
  }

  async ListarFaturas(ctx) {
    try {
      console.log('DEBUG: Iniciando ListarFaturas');
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
              
              // Filtrar apenas os registros do tipo fatura
              if (record.docType === 'fatura') {
                console.log('DEBUG: Fatura encontrada:', JSON.stringify(record));
                allResults.push(record);
              } else {
                console.log('DEBUG: Registro não é fatura, docType:', record.docType);
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
      
      console.log('DEBUG: Total de faturas encontradas:', allResults.length);
      console.log('DEBUG: Lista de faturas:', JSON.stringify(allResults));
      
      return JSON.stringify(allResults);
      
    } catch (error) {
      console.error('ERRO em ListarFaturas:', error);
      throw new Error(`Falha ao buscar faturas: ${error.message}`);
    }
  }

}

module.exports = BPMNContract;