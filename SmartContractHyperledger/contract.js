'use strict';

const { Contract } = require('fabric-contract-api');
const { Participant } = require('./models');
const OrderOperations = require('./operations/OrderOperations');
const InvoiceOperations = require('./operations/InvoiceOperations');

class BPMNContract extends Contract {
    
    constructor() {
        super('BPMNContract');
        this.orderOps = new OrderOperations();
        this.invoiceOps = new InvoiceOperations();
    }

    async InitLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        console.info('============= END : Initialize Ledger ===========');
    }

    // ==================== PARTICIPANT OPERATIONS ====================

    async createFornecedor(ctx) {
        const participant = new Participant(
            'Participant_0hd3cwc',
            'Fornecedor',
            'fornecedor',
            'Fornecedor Organization'
        );
        
        await ctx.stub.putState(participant.id, Buffer.from(JSON.stringify(participant.toJSON())));
        return JSON.stringify(participant.toJSON());
    }

    async createOrg1(ctx) {
        const participant = new Participant(
            'Participant_0yooi20',
            'Org 1',
            'org',
            'Org 1 Organization'
        );
        
        await ctx.stub.putState(participant.id, Buffer.from(JSON.stringify(participant.toJSON())));
        return JSON.stringify(participant.toJSON());
    }

    async createOrg2(ctx) {
        const participant = new Participant(
            'Participant_121sf45',
            'Org 2',
            'org',
            'Org 2 Organization'
        );
        
        await ctx.stub.putState(participant.id, Buffer.from(JSON.stringify(participant.toJSON())));
        return JSON.stringify(participant.toJSON());
    }

    async getAllParticipants(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.toString()) {
                try {
                    const strValue = res.value.toString();
                    const record = JSON.parse(strValue);
                if (record.docType === 'participant') {
                    allResults.push(record);
                    }
                } catch (err) {
                    console.error('Error parsing participant record:', err);
                    console.error('Raw record:', res.value.toString());
                }
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return JSON.stringify(allResults);
    }

    // ==================== DATASTORE OPERATIONS ====================

    async createfaturas(ctx) {
        const dataStore = {
            id: 'DataStoreReference_0yt20xj',
            name: 'faturas',
            type: 'database',
            docType: 'datastore'
        };
        
        await ctx.stub.putState(dataStore.id, Buffer.from(JSON.stringify(dataStore)));
        return JSON.stringify(dataStore);
    }

    async createencomendas(ctx) {
        const dataStore = {
            id: 'DataStoreReference_1ynha5w',
            name: 'encomendas',
            type: 'database',
            docType: 'datastore'
        };
        
        await ctx.stub.putState(dataStore.id, Buffer.from(JSON.stringify(dataStore)));
        return JSON.stringify(dataStore);
    }

    async getAllDataStores(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.toString()) {
                const record = JSON.parse(res.value.toString());
                if (record.docType === 'datastore') {
                    allResults.push(record);
                }
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return JSON.stringify(allResults);
    }

    // ==================== ORDER OPERATIONS ====================

    async CriarEncomenda(ctx, customerId, supplierId) {
        return await this.orderOps.CriarEncomenda(ctx, customerId, supplierId);
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

    // ==================== UTILITY METHODS ====================

    async getAllAssets(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.toString()) {
                const record = JSON.parse(res.value.toString());
                allResults.push(record);
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return JSON.stringify(allResults);
    }
}

module.exports = BPMNContract; 