'use strict';

const BaseEntity = require('./BaseEntity');

/**
 * Estados possíveis de uma tarefa
 */
const TASK_STATES = {
    PENDING: 'pending',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    FAILED: 'failed',
    ESCALATED: 'escalated',
    CANCELLED: 'cancelled'
};

/**
 * Tipos de tarefa
 */
const TASK_TYPES = {
    USER_TASK: 'user_task',
    SERVICE_TASK: 'service_task',
    MANUAL_TASK: 'manual_task',
    SCRIPT_TASK: 'script_task',
    BUSINESS_RULE_TASK: 'business_rule_task'
};

/**
 * Classe que representa uma tarefa no processo BPMN
 * Herda de BaseEntity para ter campos comuns
 */
class Task extends BaseEntity {
    constructor(id, name, type, processId) {
        super(id, 'task');
        this.name = name;
        this.type = type;
        this.processId = processId;
        this.status = TASK_STATES.PENDING;
        this.dependencies = [];
        this.inputData = {};
        this.outputData = {};
    }

    /**
     * Atualiza o status da tarefa
     */
    updateStatus(newStatus) {
        if (TASK_STATES[newStatus.toUpperCase()]) {
            this.status = newStatus.toLowerCase();
        } else {
            throw new Error(`Invalid task status: ${newStatus}`);
        }
    }

    /**
     * Adiciona uma dependência
     */
    addDependency(taskId) {
        if (!this.dependencies.includes(taskId)) {
            this.dependencies.push(taskId);
        }
    }

    /**
     * Verifica se todas as dependências estão completas
     */
    areDependenciesCompleted(completedTasks) {
        return this.dependencies.every(depId => completedTasks.includes(depId));
    }

    /**
     * Converte para objeto JSON
     */
    toJSON() {
        return {
            ...super.toJSON(),
            name: this.name,
            taskType: this.type,
            processId: this.processId,
            status: this.status,
            dependencies: this.dependencies,
            inputData: this.inputData,
            outputData: this.outputData
        };
    }

    /**
     * Cria uma tarefa a partir de dados JSON
     */
    static fromJSON(data) {
        const task = new Task(data.id, data.name, data.taskType, data.processId);
        task.status = data.status || TASK_STATES.PENDING;
        task.dependencies = data.dependencies || [];
        task.inputData = data.inputData || {};
        task.outputData = data.outputData || {};
        task.createdAt = data.createdAt;
        return task;
    }

    /**
     * Retorna os estados válidos
     */
    static getValidStates() {
        return Object.values(TASK_STATES);
    }

    /**
     * Retorna os tipos válidos
     */
    static getValidTypes() {
        return Object.values(TASK_TYPES);
    }
}

module.exports = { Task, TASK_STATES, TASK_TYPES }; 