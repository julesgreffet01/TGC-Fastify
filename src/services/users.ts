import type {FastifyReply, FastifyRequest} from "fastify";
import type {ResponseApi} from "../interfaces/responseApi.js";
import fs from 'node:fs'
import type {UserInterface} from "../interfaces/userInterface.js";
import {UserDAO} from "../database/DAO/userDAO.js";

export async function RegisterUser(req: FastifyRequest<{ Body: { username: string, password: string } }>, res: FastifyReply) {
    // let users: UserInterface[] = [];
    // try {
    //     const data = fs.readFileSync('data/users.json', 'utf-8').trim();
    //     users = data ? JSON.parse(data) : [];
    // } catch (err) {
    //     users = [];
    // }
    // let userId
    // if(users.length > 0){
    //     userId = users[users.length - 1].id + 1;
    // } else {
    //     userId = 1
    // }
    // if(users.find(user => user.username === req.body.username)) {
    //     res.status(401).send({message: "ce nom d utilisateur existe deja"})
    // }
    //
    // const newUser: UserInterface = {
    //     id: userId,
    //     username: req.body.username,
    //     password: req.body.password,
    //     collection: []
    // }
    // users.push(newUser);
    // fs.writeFileSync('data/users.json', JSON.stringify(users));
    //--------------------- database ------------------
    const userDao = new UserDAO();
    try {
        const userExist = await userDao.findByUsername(req.body.username);
        if(userExist) {
            res.status(401).send({message: "ce nom d utilisateur existe deja"})
            return;
        }
        await userDao.createUser(req.body.username, req.body.password);
    } catch (err) {
        res.status(500).send({message: "une erreur est survenue sur le serveur"})
        return;
    }
    const response: ResponseApi = {
        message: 'creation reussi',
        data: {
            'username': req.body.username,
        }
    }
    res.status(201).send(response);
}

export async function login(req: FastifyRequest<{ Body: { username: string, password: string } }>, res: FastifyReply) {
    // const users: UserInterface[] = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
    // const user = users.find(user => user.username === req.body.username);

    // if (!user || user.password !== req.body.password) {
    //     res.status(401).send({error: "user not found"})
    //     return;
    // }

    //-------------- database ----------
    const userDao = new UserDAO();
    let user: UserInterface;
    try {
        const loginRes = await userDao.login(req.body.username, req.body.password);
        if(!loginRes){
            res.status(401).send({message: "L'authentification a fail"});
            return;
        }
        user = loginRes;
    } catch (err) {
        res.status(500).send({message: "une erreur est survenue sur le serveur"})
        return;
    }
    const response: ResponseApi = {
        message: 'auth reussi',
        data: {
            'token': user.token,
        }
    }
    res.status(200).send(response);
}

export async function find(req: FastifyRequest, res: FastifyReply) {
    // const users: UserInterface[] = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
    // const user = users.find(user => user.token === req.headers.token);

    //------------- database ------------
    const userDao = new UserDAO();
    const user = await userDao.findById(req.user?.id ?? 0);
    console.log(user);
    console.log(req.user?.id);
    if (!user) {
        res.status(403).send({error: "user not found"})
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

export async function update(req: FastifyRequest<{
    Body: { username?: string, password?: string }, Headers: { token: string }
}>, res: FastifyReply) {
    // const users: UserInterface[] = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
    // const user = users.find(user => user.token === req.headers.token);
    // if (!user) {
    //     res.status(403).send({error: "token invalid"})
    //     return;
    // }

    //-------------- database -------------
    const userDao = new UserDAO();
    const user = await userDao.findById(req.user?.id ?? 0);
    if(!user) {
        res.status(403).send({error: "user not found"})
        return;
    }
    if (req.body.username) {
        user.username = req.body.username;
    }
    if (req.body.password) {
        user.password = req.body.password;
    }
    await userDao.update(user);
    // fs.writeFileSync('data/users.json', JSON.stringify(users));
    const response: ResponseApi = {
        message: "update reussi",
        data: {
            user
        }
    }
    res.status(200).send(response);
}

export async function disconect(req: FastifyRequest<{Headers: {token: string}}>, res: FastifyReply) {
    // const users: UserInterface[] = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
    // const user = users.find(user => user.token === req.headers.token);
    const userDao = new UserDAO();
    const user = await userDao.findById(req.user?.id ?? 0);
    if (!user) {
        res.status(403).send({error: "user not found"})
        return;
    }
    await userDao.logout(user.id);
    const response: ResponseApi = {
        message: "deconnexion reussi",
        data: {}
    }
    res.status(200).send(response);
}