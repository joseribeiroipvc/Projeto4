'use strict';

const BaseEntity = require('./BaseEntity');

/**
 * Classe que representa um DataStore no processo BPMN
 * Herda de BaseEntity para ter campos comuns
 */
class DataStore extends BaseEntity {
    constructor(id, name) {
        super(id, 'datastore');
        this.name = name;
        this.type = 'database';
        this.data = {}; // Dados armazenados
    }

    /**
     * Adiciona dados ao DataStore
     */
    addData(key, value) {
        this.data[key] = {
            value: value,
            timestamp: new Date().toISOString(),
            version: 1
        };
    }

    /**
     * Remove dados do DataStore
     */
    removeData(key) {
        if (this.data[key]) {
            delete this.data[key];
        }
    }

    /**
     * Atualiza dados no DataStore
     */
    updateData(key, newValue) {
        if (this.data[key]) {
            this.data[key].value = newValue;
            this.data[key].timestamp = new Date().toISOString();
            this.data[key].version += 1;
        }
    }

    /**
     * Obtém dados do DataStore
     */
    getData(key) {
        return this.data[key] ? this.data[key].value : null;
    }

    /**
     * Obtém todos os dados do DataStore
     */
    getAllData() {
        return this.data;
    }

    /**
     * Converte para objeto JSON
     */
    toJSON() {
        return {
            ...super.toJSON(),
            name: this.name,
            datastoreType: this.type,
            data: this.data
        };
    }

    /**
     * Cria um DataStore a partir de dados JSON
     */
    static fromJSON(data) {
        const datastore = new DataStore(data.id, data.name);
        datastore.data = data.data || {};
        datastore.createdAt = data.createdAt;
        return datastore;
    }
}

module.exports = DataStore; 