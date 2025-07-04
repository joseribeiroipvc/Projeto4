'use strict';

const { v4: uuidv4 } = require('uuid');

class InvoiceOperations {
    async CriarFatura(ctx, encomendaId) {
        try {
            const encomenda = await ctx.stub.getState(encomendaId);
            if (!encomenda || encomenda.length === 0) {
                throw new Error("Encomenda associada não existe.");
            }

            const id = uuidv4();
            const timestamp = new Date().toISOString();
            const obj = {
                id,
                tipo: 'Fatura',
                encomendaId,
                dataCriacao: timestamp,
                estado: 'Criada'
            };
            await ctx.stub.putState(id, Buffer.from(JSON.stringify(obj)));
            return JSON.stringify(obj);
        } catch (error) {
            console.error('ERRO em CriarFatura:', error);
            throw new Error(`Falha ao criar fatura: ${error.message}`);
        }
    }

    async ListarFaturas(ctx) {
        try {
            console.log('DEBUG: Iniciando ListarFaturas');
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
                            
                            if (record.tipo === 'Fatura') {
                                console.log('DEBUG: Fatura encontrada:', JSON.stringify(record));
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
            
            console.log('DEBUG: Total de faturas encontradas:', allResults.length);
            console.log('DEBUG: Faturas:', JSON.stringify(allResults));
            return JSON.stringify(allResults);
        } catch (error) {
            console.error('ERRO em ListarFaturas:', error);
            throw error;
        }
    }
}

module.exports = InvoiceOperations; 