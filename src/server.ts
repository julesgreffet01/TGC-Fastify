import Fastify from 'fastify'
import * as users from './services/users'
import {registerSchema} from "./schemas/usersSchemas";
const fastify = Fastify({
    logger: true,
})

fastify.get('/', async function handler (request, reply) {
    return { hello: 'world' }
})

fastify.post('/register', registerSchema, users.RegisterUser)

const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start()