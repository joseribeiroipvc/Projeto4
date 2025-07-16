// models/State.js

class State {
    /**
     * @param {string} type - O tipo do objeto (ex: 'encomenda', 'fatura')
     * @param {Array} keyParts - Partes que compõem a chave única do objeto
     */
    constructor(type, keyParts) {
        this.type = type;        // Tipo do objeto
        this.keyParts = keyParts; // Array com partes da chave
    }

    /**
     * Retorna o tipo do objeto
     */
    getType() {
        return this.type;
    }

    /**
     * Retorna a chave composta do objeto
     */
    getKey() {
        return this.keyParts.join(':');
    }

    /**
     * Retorna as partes da chave separadamente
     */
    getSplitKey() {
        return this.keyParts;
    }

    /**
     * Serializa o objeto para armazenamento no ledger
     */
    static serialize(object) {
        return Buffer.from(JSON.stringify(object));
    }

    /**
     * Deserializa um buffer do ledger para o objeto apropriado
     */
    static deserialize(data, supportedClasses) {
        let json = JSON.parse(data.toString());
        let objClass = supportedClasses[json.type];
        if (!objClass) {
            throw new Error(`Tipo de objeto desconhecido: ${json.type}`);
        }
        let object = new (objClass)(json);
        return object;
    }

    /**
     * Converte o objeto para JSON
     */
    toJSON() {
        return {
            type: this.type,
            keyParts: this.keyParts,
            ...this
        };
    }
}

module.exports = State;