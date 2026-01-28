import type {FastifyReply, FastifyRequest} from "fastify";
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

export function login(req: FastifyRequest<{ Body: { username: string, password: string } }>, res: FastifyReply) {
    const users: UserInterface[] = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
    const user = users.find(user => user.username === req.body.username);

    if (!user) {
        res.status(401).send({error: "user not found"})
        return;
    }
    if (user?.password === req.body.password) {
        user.token = crypto.randomUUID();
        fs.writeFileSync('data/users.json', JSON.stringify(users));
        const response: ResponseApi = {
            message: 'auth reussi',
            data: {
                'token': user.token,
            }
        }
        res.status(200).send(response);
    }
}

export function find(req: FastifyRequest<{ Body: { token: string } }>, res: FastifyReply) {
    const users: UserInterface[] = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
    const user = users.find(user => user.token === req.body.token);
    if (!user) {
        res.status(401).send({error: "user not found"})
        return;
    }
    const response: ResponseApi = {
        message: 'votre user',
        data: {
            'user': user,
        }
    }
    res.status(200).send(response);
}