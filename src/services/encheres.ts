import fs from "node:fs";
import type {ResponseApi} from "../interfaces/responseApi.js";
import type {FastifyReply, FastifyRequest} from "fastify";
import type {EnchereInterface} from "../interfaces/EnchereInterface.js";
import type {UserInterface} from "../interfaces/userInterface.js";

export function getAll(req: FastifyRequest<{Headers: {token: string}}>, res: FastifyReply) {
    const users: UserInterface[] = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
    const user = users.find(user => user.token === req.headers.token);
    if (!user) {
        res.status(403).send({error: "token invalid"})
        return;
    }
    let encheres: EnchereInterface[] = []
    let message: string;
    try {
        encheres = JSON.parse(fs.readFileSync('data/encheres.json', 'utf-8'));
        message = "voici toutes les encheres disponible"
    } catch (err) {
        message = "il n y a pas d enchere pour le moment"
        encheres = [];
    }
    const response: ResponseApi = {
        message,
        data: encheres,
    }
    return res.status(200).send(response);
}

export function find(req: FastifyRequest<{Headers: {token: string}, Params: {idEnchere: string}}>, res: FastifyReply){
    const users: UserInterface[] = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
    const user = users.find(user => user.token === req.headers.token);
    if (!user) {
        res.status(403).send({error: "token invalid"})
        return;
    }
    let encheres: EnchereInterface[] = []
    try {
        encheres = JSON.parse(fs.readFileSync('data/encheres.json', 'utf-8'));
    } catch (err) {
        encheres = [];
    }
    const enchere = encheres.find(enchere => enchere.id === Number(req.params.idEnchere));
    if (!enchere) {
        res.status(405).send({error: "cette enchere n existe pas"})
        return
    }
    const response: ResponseApi = {
        message: `voici l enchere a l id ${req.params.idEnchere}`,
        data: enchere,
    }
    res.status(200).send(response);
}