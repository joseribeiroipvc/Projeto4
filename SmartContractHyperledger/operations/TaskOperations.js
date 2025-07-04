'use strict';

const { Task, TASK_STATES, TASK_TYPES } = require('../models/Task');

/**
 * Operações específicas para gestão de tarefas
 */
class TaskOperations {
    
    /**
     * Cria uma nova tarefa
     */
    async createTask(ctx, id, name, type, processId) {
        const exists = await this.taskExists(ctx, id);
        if (exists) {
            throw new Error(`Task ${id} already exists`);
        }
        
        const task = new Task(id, name, type, processId);
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(task.toJSON())));
        return JSON.stringify(task.toJSON());
    }

    /**
     * Lê uma tarefa pelo ID
     */
    async readTask(ctx, id) {
        const taskJSON = await ctx.stub.getState(id);
        if (!taskJSON || taskJSON.length === 0) {
            throw new Error(`Task ${id} does not exist`);
        }
        return taskJSON.toString();
    }

    /**
     * Atualiza uma tarefa
     */
    async updateTask(ctx, id, name, type, processId) {
        const exists = await this.taskExists(ctx, id);
        if (!exists) {
            throw new Error(`Task ${id} does not exist`);
        }
        
        const task = new Task(id, name, type, processId);
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(task.toJSON())));
        return JSON.stringify(task.toJSON());
    }

    /**
     * Remove uma tarefa
     */
    async deleteTask(ctx, id) {
        const exists = await this.taskExists(ctx, id);
        if (!exists) {
            throw new Error(`Task ${id} does not exist`);
        }
        await ctx.stub.deleteState(id);
    }

    /**
     * Verifica se uma tarefa existe
     */
    async taskExists(ctx, id) {
        const taskJSON = await ctx.stub.getState(id);
        return taskJSON && taskJSON.length > 0;
    }

    /**
     * Obtém todas as tarefas
     */
    async getAllTasks(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Filtra apenas tarefas
                if (record.type === 'task') {
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
     * Atualiza o status de uma tarefa
     */
    async updateTaskStatus(ctx, id, newStatus) {
        const taskJSON = await ctx.stub.getState(id);
        if (!taskJSON || taskJSON.length === 0) {
            throw new Error(`Task ${id} does not exist`);
        }
        
        const taskData = JSON.parse(taskJSON.toString());
        const task = Task.fromJSON(taskData);
        task.updateStatus(newStatus);
        
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(task.toJSON())));
        return JSON.stringify(task.toJSON());
    }

    /**
     * Adiciona uma dependência a uma tarefa
     */
    async addTaskDependency(ctx, taskId, dependencyId) {
        const taskJSON = await ctx.stub.getState(taskId);
        if (!taskJSON || taskJSON.length === 0) {
            throw new Error(`Task ${taskId} does not exist`);
        }
        
        const taskData = JSON.parse(taskJSON.toString());
        const task = Task.fromJSON(taskData);
        task.addDependency(dependencyId);
        
        await ctx.stub.putState(taskId, Buffer.from(JSON.stringify(task.toJSON())));
        return JSON.stringify(task.toJSON());
    }

    /**
     * Define dados de entrada para uma tarefa
     */
    async setTaskInputData(ctx, taskId, inputData) {
        const taskJSON = await ctx.stub.getState(taskId);
        if (!taskJSON || taskJSON.length === 0) {
            throw new Error(`Task ${taskId} does not exist`);
        }
        
        const taskData = JSON.parse(taskJSON.toString());
        const task = Task.fromJSON(taskData);
        task.inputData = { ...task.inputData, ...inputData };
        
        await ctx.stub.putState(taskId, Buffer.from(JSON.stringify(task.toJSON())));
        return JSON.stringify(task.toJSON());
    }

    /**
     * Define dados de saída para uma tarefa
     */
    async setTaskOutputData(ctx, taskId, outputData) {
        const taskJSON = await ctx.stub.getState(taskId);
        if (!taskJSON || taskJSON.length === 0) {
            throw new Error(`Task ${taskId} does not exist`);
        }
        
        const taskData = JSON.parse(taskJSON.toString());
        const task = Task.fromJSON(taskData);
        task.outputData = { ...task.outputData, ...outputData };
        
        await ctx.stub.putState(taskId, Buffer.from(JSON.stringify(task.toJSON())));
        return JSON.stringify(task.toJSON());
    }

    /**
     * Obtém tarefas por processo
     */
    async getTasksByProcess(ctx, processId) {
        const allTasks = JSON.parse(await this.getAllTasks(ctx));
        return JSON.stringify(allTasks.filter(t => t.processId === processId));
    }

    /**
     * Obtém tarefas por status
     */
    async getTasksByStatus(ctx, status) {
        const allTasks = JSON.parse(await this.getAllTasks(ctx));
        return JSON.stringify(allTasks.filter(t => t.status === status));
    }

    /**
     * Obtém tarefas por tipo
     */
    async getTasksByType(ctx, type) {
        const allTasks = JSON.parse(await this.getAllTasks(ctx));
        return JSON.stringify(allTasks.filter(t => t.taskType === type));
    }

    /**
     * Verifica se uma tarefa pode ser executada
     */
    async canTaskBeExecuted(ctx, taskId) {
        const taskJSON = await ctx.stub.getState(taskId);
        if (!taskJSON || taskJSON.length === 0) {
            throw new Error(`Task ${taskId} does not exist`);
        }
        
        const taskData = JSON.parse(taskJSON.toString());
        const task = Task.fromJSON(taskData);
        
        // Obtém tarefas completadas do mesmo processo
        const processTasks = JSON.parse(await this.getTasksByProcess(ctx, task.processId));
        const completedTasks = processTasks
            .filter(t => t.status === TASK_STATES.COMPLETED)
            .map(t => t.id);
        
        return task.areDependenciesCompleted(completedTasks);
    }
}

module.exports = TaskOperations; 