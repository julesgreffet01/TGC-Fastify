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
        body: {
            type: 'object',
            required: ['token'],
            properties: {
                token: {type: 'string'},
            }
        }
    }
}