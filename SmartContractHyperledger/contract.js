'use strict';

const { Contract } = require('fabric-contract-api');

class BPMNContract extends Contract {
    
    async InitLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        console.info('============= END : Initialize Ledger ===========');
    }

    // Asset management functions
    async createAsset(ctx, id, data) {
        const exists = await this.assetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }
        const asset = { id, data };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
        return JSON.stringify(asset);
    }

    async readAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    async updateAsset(ctx, id, newData) {
        const exists = await this.assetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        const asset = { id, data: newData };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
        return JSON.stringify(asset);
    }

    async deleteAsset(ctx, id) {
        const exists = await this.assetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        await ctx.stub.deleteState(id);
    }

    async assetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    async getAllAssets(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    async createFornecedor(ctx) {
        const participant = {
            id: 'Participant_1',
            name: 'Fornecedor'
        };
        await ctx.stub.putState('Participant_1', Buffer.from(JSON.stringify(participant)));
        return JSON.stringify(participant);
    }

    async createCliente(ctx) {
        const participant = {
            id: 'Participant_2',
            name: 'Cliente'
        };
        await ctx.stub.putState('Participant_2', Buffer.from(JSON.stringify(participant)));
        return JSON.stringify(participant);
    }

    async createOrg1(ctx) {
        const participant = {
            id: 'Participant_3',
            name: 'Org 1'
        };
        await ctx.stub.putState('Participant_3', Buffer.from(JSON.stringify(participant)));
        return JSON.stringify(participant);
    }

    async createPedidos(ctx) {
        const asset = {
            id: 'DataStore_1',
            name: 'Pedidos'
        };
        await ctx.stub.putState('DataStore_1', Buffer.from(JSON.stringify(asset)));
        return JSON.stringify(asset);
    }

    async ReceberPedido(ctx) {
        // Task: Receber Pedido executada por Participant_2
        console.log("Participant_2 executa Receber Pedido");
        return true;
    }

    async ProcessarPedido(ctx) {
        // Task: Processar Pedido executada por UnknownOrg
        console.log("UnknownOrg executa Processar Pedido");
        return true;
    }
}

module.exports = BPMNContract; 