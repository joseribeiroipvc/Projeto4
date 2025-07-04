'use strict';

const DataStore = require('../models/DataStore');

/**
 * Operações específicas para gestão de DataStores
 */
class DataStoreOperations {
    
    /**
     * Cria um novo DataStore
     */
    async createDataStore(ctx, id, name) {
        const exists = await this.dataStoreExists(ctx, id);
        if (exists) {
            throw new Error(`DataStore ${id} already exists`);
        }
        
        const dataStore = new DataStore(id, name);
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(dataStore.toJSON())));
        return JSON.stringify(dataStore.toJSON());
    }

    /**
     * Lê um DataStore pelo ID
     */
    async readDataStore(ctx, id) {
        const dataStoreJSON = await ctx.stub.getState(id);
        if (!dataStoreJSON || dataStoreJSON.length === 0) {
            throw new Error(`DataStore ${id} does not exist`);
        }
        return dataStoreJSON.toString();
    }

    /**
     * Atualiza um DataStore
     */
    async updateDataStore(ctx, id, name) {
        const exists = await this.dataStoreExists(ctx, id);
        if (!exists) {
            throw new Error(`DataStore ${id} does not exist`);
        }
        
        const dataStore = new DataStore(id, name);
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(dataStore.toJSON())));
        return JSON.stringify(dataStore.toJSON());
    }

    /**
     * Remove um DataStore
     */
    async deleteDataStore(ctx, id) {
        const exists = await this.dataStoreExists(ctx, id);
        if (!exists) {
            throw new Error(`DataStore ${id} does not exist`);
        }
        await ctx.stub.deleteState(id);
    }

    /**
     * Verifica se um DataStore existe
     */
    async dataStoreExists(ctx, id) {
        const dataStoreJSON = await ctx.stub.getState(id);
        return dataStoreJSON && dataStoreJSON.length > 0;
    }

    /**
     * Obtém todos os DataStores
     */
    async getAllDataStores(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Filtra apenas DataStores
                if (record.type === 'datastore') {
                    allResults.push(record);
                }
            } catch (err) {
                console.log(err);
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    /**
     * Adiciona dados a um DataStore
     */
    async addDataToStore(ctx, dataStoreId, key, value) {
        const dataStoreJSON = await ctx.stub.getState(dataStoreId);
        if (!dataStoreJSON || dataStoreJSON.length === 0) {
            throw new Error(`DataStore ${dataStoreId} does not exist`);
        }
        
        const dataStoreData = JSON.parse(dataStoreJSON.toString());
        const dataStore = DataStore.fromJSON(dataStoreData);
        dataStore.addData(key, value);
        
        await ctx.stub.putState(dataStoreId, Buffer.from(JSON.stringify(dataStore.toJSON())));
        return JSON.stringify(dataStore.toJSON());
    }

    /**
     * Remove dados de um DataStore
     */
    async removeDataFromStore(ctx, dataStoreId, key) {
        const dataStoreJSON = await ctx.stub.getState(dataStoreId);
        if (!dataStoreJSON || dataStoreJSON.length === 0) {
            throw new Error(`DataStore ${dataStoreId} does not exist`);
        }
        
        const dataStoreData = JSON.parse(dataStoreJSON.toString());
        const dataStore = DataStore.fromJSON(dataStoreData);
        dataStore.removeData(key);
        
        await ctx.stub.putState(dataStoreId, Buffer.from(JSON.stringify(dataStore.toJSON())));
        return JSON.stringify(dataStore.toJSON());
    }

    /**
     * Atualiza dados em um DataStore
     */
    async updateDataInStore(ctx, dataStoreId, key, newValue) {
        const dataStoreJSON = await ctx.stub.getState(dataStoreId);
        if (!dataStoreJSON || dataStoreJSON.length === 0) {
            throw new Error(`DataStore ${dataStoreId} does not exist`);
        }
        
        const dataStoreData = JSON.parse(dataStoreJSON.toString());
        const dataStore = DataStore.fromJSON(dataStoreData);
        dataStore.updateData(key, newValue);
        
        await ctx.stub.putState(dataStoreId, Buffer.from(JSON.stringify(dataStore.toJSON())));
        return JSON.stringify(dataStore.toJSON());
    }

    /**
     * Obtém dados de um DataStore
     */
    async getDataFromStore(ctx, dataStoreId, key) {
        const dataStoreJSON = await ctx.stub.getState(dataStoreId);
        if (!dataStoreJSON || dataStoreJSON.length === 0) {
            throw new Error(`DataStore ${dataStoreId} does not exist`);
        }
        
        const dataStoreData = JSON.parse(dataStoreJSON.toString());
        const dataStore = DataStore.fromJSON(dataStoreData);
        const value = dataStore.getData(key);
        
        return JSON.stringify({ dataStoreId, key, value });
    }

    /**
     * Obtém todos os dados de um DataStore
     */
    async getAllDataFromStore(ctx, dataStoreId) {
        const dataStoreJSON = await ctx.stub.getState(dataStoreId);
        if (!dataStoreJSON || dataStoreJSON.length === 0) {
            throw new Error(`DataStore ${dataStoreId} does not exist`);
        }
        
        const dataStoreData = JSON.parse(dataStoreJSON.toString());
        const dataStore = DataStore.fromJSON(dataStoreData);
        const allData = dataStore.getAllData();
        
        return JSON.stringify({ dataStoreId, data: allData });
    }

    /**
     * Obtém DataStores por tipo
     */
    async getDataStoresByType(ctx, type) {
        const allDataStores = JSON.parse(await this.getAllDataStores(ctx));
        return JSON.stringify(allDataStores.filter(ds => ds.datastoreType === type));
    }

    /**
     * Obtém DataStores ativos
     */
    async getActiveDataStores(ctx) {
        const allDataStores = JSON.parse(await this.getAllDataStores(ctx));
        return JSON.stringify(allDataStores.filter(ds => ds.isActive));
    }

    /**
     * Define DataStore como somente leitura
     */
    async setDataStoreReadOnly(ctx, dataStoreId, isReadOnly) {
        const dataStoreJSON = await ctx.stub.getState(dataStoreId);
        if (!dataStoreJSON || dataStoreJSON.length === 0) {
            throw new Error(`DataStore ${dataStoreId} does not exist`);
        }
        
        const dataStoreData = JSON.parse(dataStoreJSON.toString());
        const dataStore = DataStore.fromJSON(dataStoreData);
        dataStore.setReadOnly(isReadOnly);
        
        await ctx.stub.putState(dataStoreId, Buffer.from(JSON.stringify(dataStore.toJSON())));
        return JSON.stringify(dataStore.toJSON());
    }
}

module.exports = DataStoreOperations; 