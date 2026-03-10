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
import * as encheres from './services/encheres.js'
import {
    CloseEnchereSchema,
    createEnchereSchema,
    findEnchereSchemas,
    getAllEncheresSchemas,
    PlaceOnEnchereSchema
} from "./schemas/encheresSchemas.js";
import {UserDAO} from "./database/DAO/userDAO.js";
import {tokenMiddleware} from "./middlewares/tokenMiddleware.js";

declare module "fastify" {
    interface FastifyRequest {
        user: {
            id: number;
        } | null;
    }
}
const fastify = Fastify({logger: true})

fastify.decorateRequest("user", null);

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
fastify.register(async function (fastify){

    //------------- middleware --------------
    fastify.addHook("preHandler", tokenMiddleware)

    //-------------- users -----------
    fastify.get('/user', findSchema, users.find)
    fastify.patch('/user', updateSchema, users.update)
    fastify.delete('/disconnect', users.disconect)

    //------------- cards -----------------
    fastify.get('/openBooster', openBoosterSchema, cards.openBooster)
    fastify.post('/convert/:idCard', cards.convert)

    // ---------------------- bid -------------
    fastify.post('/bid', createEnchereSchema, encheres.create)
    fastify.put('/bid', PlaceOnEnchereSchema, encheres.placeOnEnchere)
    fastify.delete('/bid', CloseEnchereSchema, encheres.closeEnchere)
}, {})  //routes qui necessites une auth


// ------------ cards ------------
fastify.get('/cards', cards.getAll)


//---------------- encheres -------------
fastify.get('/bid', getAllEncheresSchemas, encheres.getAll)
fastify.get('/bid/:idEnchere', findEnchereSchemas, encheres.find)



await fastify.listen({port: 3000})