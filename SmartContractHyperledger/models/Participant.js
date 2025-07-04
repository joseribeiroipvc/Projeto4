'use strict';

class Participant {
    constructor(id, name, tipo) {
        this.id = id;
        this.name = name;
        this.docType = 'participant';
        this.tipo = tipo; // 'fornecedor' ou 'organizacao'
        this.dataCriacao = new Date().toISOString();
    }

    /**
     * Converte para objeto JSON
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            docType: this.docType,
            tipo: this.tipo,
            dataCriacao: this.dataCriacao
        };
    }

}

module.exports = Participant; 