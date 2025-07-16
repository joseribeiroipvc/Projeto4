'use strict';

/**
 * Classe base para todas as entidades do sistema
 */
class BaseEntity {
    constructor(id, type) {
        this.id = id;
        this.type = type;
        this.createdAt = new Date().toISOString();
    }

    /**
     * Converte para objeto JSON
     */
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            createdAt: this.createdAt
        };
    }

    /**
     * Retorna o ID da entidade
     */
    getId() {
        return this.id;
    }

    /**
     * Retorna o tipo da entidade
     */
    getType() {
        return this.type;
    }

    /**
     * Retorna a data de criação
     */
    getCreatedAt() {
        return this.createdAt;
    }
}

module.exports = BaseEntity; 