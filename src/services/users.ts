import type {FastifyRequest, FastifyReply, RouteShorthandOptions, FastifySchema} from "fastify";
import type {ResponseApi} from "../interfaces/responseApi";
import fs from 'node:fs'
import type {UserInterface} from "../interfaces/userInterface";

export function RegisterUser(req: FastifyRequest<{ Body: { username: string, password: string } }>, res: FastifyReply) {
    const users: UserInterface[] = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
    const userId = users[users.length - 1].id + 1;
    const newUser: UserInterface = {
        id: userId,
        username: req.body.username,
        password: req.body.password,
        collection: []
    }
    users.push(newUser);
    fs.writeFileSync('data/users.json', JSON.stringify(users));
    const response: ResponseApi = {
        message: 'creation reussi',
        data: {
            'username': req.body.username,
        }
    }
    res.status(201).send(response);
}

export function login(req: FastifyRequest<{ Body: {username: string, password: string} }>, res: FastifyReply) {

}