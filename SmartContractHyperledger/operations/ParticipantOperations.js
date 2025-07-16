'use strict';

const Participant = require('../models/Participant');

/**
 * Operações específicas para gestão de participantes
 */
class ParticipantOperations {
    
    /**
     * Cria um novo participante
     */
    async createParticipant(ctx, id, name, type, organization) {
        const exists = await this.participantExists(ctx, id);
        if (exists) {
            throw new Error(`Participant ${id} already exists`);
        }
        
        const participant = new Participant(id, name, type, organization);
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(participant.toJSON())));
        return JSON.stringify(participant.toJSON());
    }

    /**
     * Lê um participante pelo ID
     */
    async readParticipant(ctx, id) {
        const participantJSON = await ctx.stub.getState(id);
        if (!participantJSON || participantJSON.length === 0) {
            throw new Error(`Participant ${id} does not exist`);
        }
        return participantJSON.toString();
    }

    /**
     * Atualiza um participante
     */
    async updateParticipant(ctx, id, name, type, organization) {
        const exists = await this.participantExists(ctx, id);
        if (!exists) {
            throw new Error(`Participant ${id} does not exist`);
        }
        
        const participant = new Participant(id, name, type, organization);
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(participant.toJSON())));
        return JSON.stringify(participant.toJSON());
    }

    /**
     * Remove um participante
     */
    async deleteParticipant(ctx, id) {
        const exists = await this.participantExists(ctx, id);
        if (!exists) {
            throw new Error(`Participant ${id} does not exist`);
        }
        await ctx.stub.deleteState(id);
    }

    /**
     * Verifica se um participante existe
     */
    async participantExists(ctx, id) {
        const participantJSON = await ctx.stub.getState(id);
        return participantJSON && participantJSON.length > 0;
    }

    /**
     * Obtém todos os participantes
     */
    async getAllParticipants(ctx) {
        try {
            console.log('DEBUG: Iniciando getAllParticipants');
        const allResults = [];
            
            console.log('DEBUG: Iniciando getStateByRange');
        const iterator = await ctx.stub.getStateByRange('', '');
            console.log('DEBUG: Iterator criado');
            
            try {
                let count = 0;
                while (true) {
                    console.log('DEBUG: Iteração', count++);
                    const res = await iterator.next();
        
                    if (res.done) {
                        console.log('DEBUG: Iterator finalizado após', count, 'iterações');
                        break;
                    }
                    
                    if (res.value && res.value.value) {
                        console.log('DEBUG: Valor encontrado:', res.value.key);
                        try {
                            const strValue = res.value.value.toString('utf8');
                            console.log('DEBUG: Valor como string:', strValue);
                            
                            const record = JSON.parse(strValue);
                            console.log('DEBUG: Registro parseado:', JSON.stringify(record));
                            
                            if (record.docType === 'participant') {
                                console.log('DEBUG: Participante encontrado:', JSON.stringify(record));
                    allResults.push(record);
                            } else {
                                console.log('DEBUG: Registro não é participante, docType:', record.docType);
                }
            } catch (err) {
                            console.error('Erro ao processar registro:', err);
                            console.error('Registro raw:', res.value.toString());
            }
                    } else {
                        console.log('DEBUG: Valor nulo ou indefinido encontrado');
                    }
                }
            } finally {
                console.log('DEBUG: Fechando iterator');
                await iterator.close();
            }
            
            console.log('DEBUG: Total de participantes encontrados:', allResults.length);
            console.log('DEBUG: Lista de participantes:', JSON.stringify(allResults));
            
        return JSON.stringify(allResults);
            
        } catch (error) {
            console.error('ERRO em getAllParticipants:', error);
            throw new Error(`Falha ao buscar participantes: ${error.message}`);
        }
    }

    /**
     * Obtém participantes por tipo
     */
    async getParticipantsByType(ctx, type) {
        const allParticipants = JSON.parse(await this.getAllParticipants(ctx));
        return JSON.stringify(allParticipants.filter(p => p.participantType === type));
    }

    /**
     * Obtém participantes disponíveis
     */
    async getAvailableParticipants(ctx) {
        const allParticipants = JSON.parse(await this.getAllParticipants(ctx));
        return JSON.stringify(allParticipants.filter(p => p.isAvailable));
    }

    async createFornecedor(ctx) {
        try {
            console.log('DEBUG: Iniciando createFornecedor');
            
            const timestamp = ctx.stub.getTxTimestamp();
            const participant = Participant.createFornecedor(timestamp);
            
            console.log('DEBUG: Participante criado:', JSON.stringify(participant));
            await ctx.stub.putState(participant.id, Buffer.from(JSON.stringify(participant.toJSON())));
            console.log('DEBUG: Participante salvo com ID:', participant.id);
            
            return JSON.stringify(participant.toJSON());
        } catch (error) {
            console.error('ERRO em createFornecedor:', error);
            throw new Error(`Falha ao criar fornecedor: ${error.message}`);
        }
    }

    async createOrg1(ctx) {
        try {
            console.log('DEBUG: Iniciando createOrg1');
            
            const timestamp = ctx.stub.getTxTimestamp();
            const participant = Participant.createOrg1(timestamp);
            
            console.log('DEBUG: Participante criado:', JSON.stringify(participant));
            await ctx.stub.putState(participant.id, Buffer.from(JSON.stringify(participant.toJSON())));
            console.log('DEBUG: Participante salvo com ID:', participant.id);
            
            return JSON.stringify(participant.toJSON());
        } catch (error) {
            console.error('ERRO em createOrg1:', error);
            throw new Error(`Falha ao criar Org1: ${error.message}`);
        }
    }

    async createOrg2(ctx) {
        try {
            console.log('DEBUG: Iniciando createOrg2');
            
            const timestamp = ctx.stub.getTxTimestamp();
            const participant = Participant.createOrg2(timestamp);
            
            console.log('DEBUG: Participante criado:', JSON.stringify(participant));
            await ctx.stub.putState(participant.id, Buffer.from(JSON.stringify(participant.toJSON())));
            console.log('DEBUG: Participante salvo com ID:', participant.id);
            
            return JSON.stringify(participant.toJSON());
        } catch (error) {
            console.error('ERRO em createOrg2:', error);
            throw new Error(`Falha ao criar Org2: ${error.message}`);
        }
    }
}

module.exports = ParticipantOperations; 