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
    let encheres: EnchereInterface[];
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

export function create(req: FastifyRequest<{Headers: {token: string}, Body: {idCarte: number, earlyPrice?: number}}>, res: FastifyReply){
    const users: UserInterface[] = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
    const user = users.find(user => user.token === req.headers.token);
    if (!user) {
        res.status(403).send({error: "token invalid"})
        return;
    }
    const collectionRow = user.collection.find(row => row.id === req.body.idCarte)
    if(!collectionRow) {
        res.status(401).send({error: "le joueur n'as pas la carte"})
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
    let enchereId;
    if(encheres.length > 0) {
        enchereId = encheres.length;
    } else {
        enchereId = 1;
    }
    collectionRow.qt --
    if(collectionRow.qt === 0){
        console.log('y a r')
        const indexToDelete = user.collection.findIndex(row => row.id === req.body.idCarte)
        user.collection.splice(indexToDelete, 1);
    }
    const newEncheres: EnchereInterface = {
        id: enchereId,
        card_id: req.body.idCarte,
        seller_id: user.id,
        end_date: null,
        bidder_id: null,
        bid: req.body.earlyPrice ?? 0,
    }
    encheres.push(newEncheres);
    fs.writeFileSync('data/encheres.json', JSON.stringify(encheres));
    fs.writeFileSync('data/users.json', JSON.stringify(users));
    const response: ResponseApi = {
        message: "ajout de l enchere",
        data: newEncheres,
    }
    res.status(200).send(response);
}