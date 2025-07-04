'use strict';

const BaseEntity = require('./BaseEntity');
const Product = require('./Product');

/**
 * Estados possíveis de um pedido
 */
const ORDER_STATES = {
    APPROVED: 'approved',
    PROCESSING: 'processing',
    REJECTED: 'rejected'
};

/**
 * Classe que representa um pedido no sistema
 * Herda de BaseEntity para ter campos comuns
 */
class Order extends BaseEntity {
    constructor(id, customerId, supplierId) {
        super(id, 'order');
        this.customerId = customerId;
        this.supplierId = supplierId;
        this.status = ORDER_STATES.PROCESSING;
        this.items = [];
    }

    /**
     * Adiciona um item ao pedido
     */
    addItem(product, quantity) {
        this.items.push({
            id: product.id,             // id do produto
            name: product.name,         // nome do produto
            quantity: quantity,         // quantidade encomendada
            unitPrice: product.price,   // preço unitário do produto
            totalPrice: quantity * product.price
        });
    }

    /**
     * Atualiza o status do pedido
     */
    updateStatus(newStatus) {
        if (ORDER_STATES[newStatus.toUpperCase()]) {
            this.status = newStatus.toLowerCase();
        } else {
            throw new Error(`Invalid order status: ${newStatus}`);
        }
    }

    /**
     * Converte para objeto JSON
     */
    toJSON() {
        return {
            ...super.toJSON(),
            customerId: this.customerId,
            supplierId: this.supplierId,
            status: this.status,
            items: this.items
        };
    }

    /**
     * Cria um pedido a partir de dados JSON
     */
    static fromJSON(data) {
        const order = new Order(data.id, data.customerId, data.supplierId);
        order.status = data.status || ORDER_STATES.PROCESSING;
        order.items = data.items || [];
        order.createdAt = data.createdAt;
        return order;
    }

    /**
     * Retorna os estados válidos
     */
    static getValidStates() {
        return Object.values(ORDER_STATES);
    }
}

module.exports = { Order, ORDER_STATES };