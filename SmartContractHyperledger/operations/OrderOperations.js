'use strict';

const { Order, ORDER_STATES } = require('../models/Order');
const { Product } = require('../models/Product');
const { v4: uuidv4 } = require('uuid');

/**
 * Operações específicas para gestão de pedidos
 */
class OrderOperations {
    
    /**
     * Cria um novo pedido
     */
    async createOrder(ctx, id, customerId, supplierId) {
        const exists = await this.orderExists(ctx, id);
        if (exists) {
            throw new Error(`Order ${id} already exists`);
        }
        
        const order = new Order(id, customerId, supplierId);
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(order.toJSON())));
        return JSON.stringify(order.toJSON());
    }

    /**
     * Lê um pedido pelo ID
     */
    async readOrder(ctx, id) {
        const orderJSON = await ctx.stub.getState(id);
        if (!orderJSON || orderJSON.length === 0) {
            throw new Error(`Order ${id} does not exist`);
        }
        return orderJSON.toString();
    }

    /**
     * Atualiza um pedido
     */
    async updateOrder(ctx, id, customerId, supplierId) {
        const exists = await this.orderExists(ctx, id);
        if (!exists) {
            throw new Error(`Order ${id} does not exist`);
        }
        
        const order = new Order(id, customerId, supplierId);
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(order.toJSON())));
        return JSON.stringify(order.toJSON());
    }

    /**
     * Remove um pedido
     */
    async deleteOrder(ctx, id) {
        const exists = await this.orderExists(ctx, id);
        if (!exists) {
            throw new Error(`Order ${id} does not exist`);
        }
        await ctx.stub.deleteState(id);
    }

    /**
     * Verifica se um pedido existe
     */
    async orderExists(ctx, id) {
        const orderJSON = await ctx.stub.getState(id);
        return orderJSON && orderJSON.length > 0;
    }

    /**
     * Obtém todos os pedidos
     */
    async getAllOrders(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Filtra apenas pedidos
                if (record.type === 'order') {
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
     * Atualiza o status de um pedido
     */
    async updateOrderStatus(ctx, id, newStatus) {
        const orderJSON = await ctx.stub.getState(id);
        if (!orderJSON || orderJSON.length === 0) {
            throw new Error(`Order ${id} does not exist`);
        }
        
        const orderData = JSON.parse(orderJSON.toString());
        const order = Order.fromJSON(orderData);
        order.updateStatus(newStatus);
        
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(order.toJSON())));
        return JSON.stringify(order.toJSON());
    }

    /**
     * Adiciona um item a um pedido
     */
    
    async addOrderItem(ctx, orderId, productId, quantity) {
        // Buscar encomenda
        const orderJSON = await ctx.stub.getState(orderId);
        if (!orderJSON || orderJSON.length === 0) {
            throw new Error(`Order ${orderId} does not exist`);
        }
        const orderData = JSON.parse(orderJSON.toString());
        const order = Order.fromJSON(orderData);
    
        // Buscar produto
        const productJSON = await ctx.stub.getState(productId);
        if (!productJSON || productJSON.length === 0) {
            throw new Error(`Product ${productId} does not exist`);
        }
        const product = Product.fromJSON(JSON.parse(productJSON.toString()));
    
        // Verificar stock
        if (product.stock < quantity) {
            throw new Error(`Not enough stock for product ${productId}`);
        }
    
        // Atualizar stock do produto
        product.stock -= quantity;
        await ctx.stub.putState(productId, Buffer.from(JSON.stringify(product.toJSON())));
    
        // Adicionar item à encomenda
        order.addItem(product, quantity);
    
        await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(order.toJSON())));
        return JSON.stringify(order.toJSON());
        }

    /**
     * 
     * Obtém pedidos por cliente
     */
    async getOrdersByCustomer(ctx, customerId) {
        const allOrders = JSON.parse(await this.getAllOrders(ctx));
        return JSON.stringify(allOrders.filter(o => o.customerId === customerId));
    }

    /**
     * Obtém pedidos por fornecedor
     */
    async getOrdersBySupplier(ctx, supplierId) {
        const allOrders = JSON.parse(await this.getAllOrders(ctx));
        return JSON.stringify(allOrders.filter(o => o.supplierId === supplierId));
    }

    /**
     * Obtém pedidos por status
     */
    async getOrdersByStatus(ctx, status) {
        const allOrders = JSON.parse(await this.getAllOrders(ctx));
        return JSON.stringify(allOrders.filter(o => o.status === status));
    }

    /**
     * Calcula o total de um pedido
     */
    async calculateOrderTotal(ctx, orderId) {
        const orderJSON = await ctx.stub.getState(orderId);
        if (!orderJSON || orderJSON.length === 0) {
            throw new Error(`Order ${orderId} does not exist`);
        }
        
        const orderData = JSON.parse(orderJSON.toString());
        const order = Order.fromJSON(orderData);
        const total = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
        
        return JSON.stringify({ orderId, total });
    }

    async CriarEncomenda(ctx) {
        try {
            const id = uuidv4();
            const timestamp = new Date().toISOString();
            const obj = {
                id,
                tipo: 'Encomenda',
                dataCriacao: timestamp,
                estado: 'Criada'
            };
            await ctx.stub.putState(id, Buffer.from(JSON.stringify(obj)));
            return JSON.stringify(obj);
        } catch (error) {
            console.error('ERRO em CriarEncomenda:', error);
            throw new Error(`Falha ao criar encomenda: ${error.message}`);
        }
    }

    async ListarEncomendas(ctx) {
        try {
            console.log('DEBUG: Iniciando ListarEncomendas');
            const allResults = [];
            const iterator = await ctx.stub.getStateByRange('', '');
            let resultCount = 0;
            
            while (true) {
                const res = await iterator.next();
                
                if (res.value) {
                    try {
                        resultCount++;
                        const strValue = res.value.toString('utf8');
                        console.log(`DEBUG: Registro #${resultCount} (raw):`, strValue);
                        
                        let record;
                        try {
                            record = typeof strValue === 'string' && strValue.startsWith('{')
                                ? JSON.parse(strValue)
                                : strValue;
                            console.log(`DEBUG: Registro #${resultCount} (processado):`, record);
                            
                            if (record.tipo === 'Encomenda') {
                                console.log('DEBUG: Encomenda encontrada:', JSON.stringify(record));
                                allResults.push(record);
                            }
                        } catch (err) {
                            console.log(`DEBUG: Registro #${resultCount} não é JSON válido:`, err.message);
                        }
                    } catch (err) {
                        console.error(`ERRO ao processar registro #${resultCount}:`, err);
                        console.error('Registro raw:', res.value.toString());
                    }
                }
                
                if (res.done) {
                    await iterator.close();
                    console.log('DEBUG: Iterator finalizado após', resultCount, 'resultados');
                    break;
                }
            }
            
            console.log('DEBUG: Total de encomendas encontradas:', allResults.length);
            console.log('DEBUG: Encomendas:', JSON.stringify(allResults));
            return JSON.stringify(allResults);
        } catch (error) {
            console.error('ERRO em ListarEncomendas:', error);
            throw error;
        }
    }
}

module.exports = OrderOperations; 