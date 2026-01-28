import {FastifySchema} from "fastify";

export const registerSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
                username: {type: 'string'},
                password: {type: 'string'},
            }
        }
    }
}

export const loginSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
                username: {type: 'string'},
                password: {type: 'string'},
            }
        }
    }
}

export const findSchema = {
    schema: {
        headers: {
            type: 'object',
            required: ['token'],
            properties: {
                token: {type: 'string'},
            }
        }
    }
}

export const updateSchema = {
    schema: {
        body: {
            type: 'object',
            properties: {
                username: {type: 'string'},
                password: {type: 'string'},
            }
        },
        headers: {
            type: 'object',
            required: ['token'],
            properties: {
                token: {type: 'string'},
            }
        }
    }
}