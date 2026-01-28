import Fastify from 'fastify'
import * as users from './services/users.js'
import * as cards from './services/cards.js'
import {
    findSchema,
    loginSchema,
    registerSchema,
    updateSchema
} from './schemas/usersSchemas.js'

import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import {openBoosterSchema} from "./schemas/cardsSchemas.js";

const fastify = Fastify({logger: true})

await fastify.register(swagger, {
    openapi: {
        info: {
            title: 'Mon API de TCG sans require',
            description: 'API TCG',
            version: '1.0.0'
        },
        servers: [{url: 'http://localhost:3000'}]
    }
})

await fastify.register(swaggerUI, {
    routePrefix: '/docs'
})

// ---------- users ---------------
fastify.post('/register', registerSchema, users.RegisterUser)
fastify.post('/login', loginSchema, users.login)
fastify.get('/user', findSchema, users.find)
fastify.patch('/user', updateSchema, users.update)
fastify.delete('/disconnect', users.disconect)

// ------------ cards ------------
fastify.get('/cards', cards.getAll)
fastify.get('/openBooster', openBoosterSchema, cards.openBooster)
fastify.post('/convert/:idCard', cards.convert)


await fastify.listen({port: 3000})