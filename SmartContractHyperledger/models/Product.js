'use strict';

const BaseEntity = require('./BaseEntity');

class Product extends BaseEntity {
    constructor(id, name, stock = 0, price = 0) {
        super(id, 'product');
        this.name = name;
        this.stock = stock; 
        this.price = price; // Preço unitário
    }

    toJSON() {
        return {
            ...super.toJSON(),
            name: this.name,
            stock: this.stock,
            price: this.price
        };
    }

    static fromJSON(data) {
        const product = new Product(data.id, data.name, data.stock, data.price);
        product.createdAt = data.createdAt;
        return product;
    }
}

module.exports = Product;