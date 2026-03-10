import fs from "node:fs";
import type {ResponseApi} from "../interfaces/responseApi.js";
import type {FastifyReply, FastifyRequest} from "fastify";
import type {EnchereInterface} from "../interfaces/EnchereInterface.js";
import type {UserInterface} from "../interfaces/userInterface.js";
import {BidDAO} from "../database/DAO/bidDAO.js";
import {UserDAO} from "../database/DAO/userDAO.js";
import {resolveObjectURL} from "node:buffer";
import {findEnchereSchemas} from "../schemas/encheresSchemas.js";

export async function getAll(req: FastifyRequest<{Headers: {token: string}}>, res: FastifyReply) {
    // const users: UserInterface[] = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
    // const user = users.find(user => user.token === req.headers.token);
    // if (!user) {
    //     res.status(403).send({error: "token invalid"})
    //     return;
    // }
    // let encheres: EnchereInterface[] = []
    // let message: string;
    // try {
    //     encheres = JSON.parse(fs.readFileSync('data/encheres.json', 'utf-8'));
    //     message = "voici toutes les encheres disponible"
    // } catch (err) {
    //     message = "il n y a pas d enchere pour le moment"
    //     encheres = [];
    // }
    // encheres = encheres.filter(enchere => {
    //     return !enchere.end_date
    // })
    const bidDao = new BidDAO()
    const encheres = await bidDao.getAllValid();
    let message;
    if(encheres.length > 0){
        message = "voic toutes les offres"
    } else {
        message = 'il n y as pas d offre'
    }
    const response: ResponseApi = {
        message,
        data: encheres,
    }
    return res.status(200).send(response);
}

export async function find(req: FastifyRequest<{Headers: {token: string}, Params: {idEnchere: string}}>, res: FastifyReply){
    // const users: UserInterface[] = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
    // const user = users.find(user => user.token === req.headers.token);
    // if (!user) {
    //     res.status(403).send({error: "token invalid"})
    //     return;
    // }
    // let encheres: EnchereInterface[];
    // try {
    //     encheres = JSON.parse(fs.readFileSync('data/encheres.json', 'utf-8'));
    // } catch (err) {
    //     encheres = [];
    // }
    const bidDao = new BidDAO()
    const encheres = await bidDao.getAllValid();
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

export async function create(req: FastifyRequest<{Headers: {token: string}, Body: {idCarte: number, earlyPrice?: number}}>, res: FastifyReply){
    // const users: UserInterface[] = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
    // const user = users.find(user => user.token === req.headers.token);
    // if (!user) {
    //     res.status(403).send({error: "token invalid"})
    //     return;
    // }
    const userDao = new UserDAO()
    const user = await userDao.findById(req.user?.id ?? 0);
    if(!user){
        res.status(404).send({error: "no user found"})
        return
    }
    const collectionRow = user.collection.find(row => row.id === req.body.idCarte)
    if(!collectionRow) {
        res.status(401).send({error: "le joueur n'as pas la carte"})
        return;
    }
    // let encheres: EnchereInterface[] = []
    // let message: string;
    // try {
    //     encheres = JSON.parse(fs.readFileSync('data/encheres.json', 'utf-8'));
    //     message = "voici toutes les encheres disponible"
    // } catch (err) {
    //     message = "il n y a pas d enchere pour le moment"
    //     encheres = [];
    // }
    // let enchereId;
    // if(encheres.length > 0) {
    //     enchereId = encheres.length + 1;
    // } else {
    //     enchereId = 1;
    // }
    const bidDao = new BidDAO()
    const newBid: EnchereInterface = {
        bid: req.body.earlyPrice ?? 0,
        cardId: req.body.idCarte,
        sellerId: user.id,
        endDate: null,
        bidderId: null,
        id: 0
    }
    await bidDao.create(newBid);
    collectionRow.qt --
    await userDao.update(user)
    // const newEncheres: EnchereInterface = {
    //     id: enchereId,
    //     card_id: req.body.idCarte,
    //     seller_id: user.id,
    //     end_date: null,
    //     bidder_id: null,
    //     bid: req.body.earlyPrice ?? 0,
    // }
    // encheres.push(newEncheres);
    // fs.writeFileSync('data/encheres.json', JSON.stringify(encheres));
    // fs.writeFileSync('data/users.json', JSON.stringify(users));
    const response: ResponseApi = {
        message: "ajout de l enchere",
        data: {},
    }
    res.status(200).send(response);
}

export async function placeOnEnchere(req: FastifyRequest<{Headers: {token: string}, Body: {montant: number, idEnchere: number}}>, res: FastifyReply){
    // const users: UserInterface[] = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
    // const user = users.find(user => user.token === req.headers.token);
    // if (!user) {
    //     res.status(403).send({error: "token invalid"})
    //     return;
    // }
    const userDao = new UserDAO()
    const user = await userDao.findById(req.user?.id ?? 0);
    if(!user){
        res.status(404).send({error: "no user found"})
        return;
    }
    const bidDao = new BidDAO()
    const bid = await bidDao.findById(req.body.idEnchere)
    if(!bid) {
        res.status(404).send({error: "no bid found"})
        return;
    }
    // let encheres: EnchereInterface[];
    // try {
    //     encheres = JSON.parse(fs.readFileSync('data/encheres.json', 'utf-8'));
    // } catch (err) {
    //     encheres = [];
    // }
    // const enchere = encheres.find(enchere => enchere.id === Number(req.body.idEnchere));
    // if (!enchere) {
    //     res.status(405).send({error: "cette enchere n existe pas"})
    //     return
    // }
    // if(enchere.end_date){
    //     res.status(403).send({error: "elle est deja fermé l enchere"})
    //     return;
    // }
    if(bid.bid >= req.body.montant) {
        res.status(403).send({error: "le montant est trop bas"})
        return;
    }
    if(!user.currency || (req.body.montant > user.currency)){
        res.status(401).send({error: "l utilisateur n as pas l argent"})
        return;
    }
    if(bid.bidderId) {
        const oldBidder = await userDao.findById(bid.bidderId);
        if(!oldBidder) {
            res.status(201).send({error: 'bidder not found error'})
            return;
        }
        oldBidder.currency ? oldBidder.currency += bid.bid : oldBidder.currency = 0;
        await userDao.update(oldBidder)
    }
    user.currency -= req.body.montant;
    bid.bid = req.body.montant;
    bid.bidderId = user.id
    bid.endDate = null;
    await userDao.update(user)
    await bidDao.update(bid)
    // fs.writeFileSync('data/encheres.json', JSON.stringify(encheres));
    // fs.writeFileSync('data/users.json', JSON.stringify(users));
    const response: ResponseApi = {
        message: 'vous etes la nouvelle peronne sur l enchere',
        data: {},
    }
    res.status(200).send(response);
}

export async function closeEnchere(req: FastifyRequest<{Headers: {token: string}, Body: {idEnchere: number}}>, res: FastifyReply){
    // const users: UserInterface[] = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
    // const user = users.find(user => user.token === req.headers.token);
    // if (!user) {
    //     res.status(403).send({error: "token invalid"})
    //     return;
    // }
    // let encheres: EnchereInterface[];
    // try {
    //     encheres = JSON.parse(fs.readFileSync('data/encheres.json', 'utf-8'));
    // } catch (err) {
    //     encheres = [];
    // }
    // const enchere = encheres.find(enchere => enchere.id === Number(req.body.idEnchere));
    // if (!enchere) {
    //     res.status(405).send({error: "cette enchere n existe pas"})
    //     return
    // }
    const userDao = new UserDAO()
    const user = await userDao.findById(req.user?.id ?? 0);
    if(!user){
        res.status(404).send({error: "no user found"})
        return;
    }
    const bidDao = new BidDAO()
    const bid = await bidDao.findById(req.body.idEnchere)
    if(!bid) {
        res.status(404).send({error: "no bid found"})
        return;
    }

    if(bid.sellerId === user.id) {
        bid.endDate = new Date();
        user.currency = (user.currency ?? 0) + bid.bid;
        await bidDao.update(bid)
        await userDao.update(user)
        // fs.writeFileSync('data/encheres.json', JSON.stringify(encheres));
        // fs.writeFileSync('data/users.json', JSON.stringify(users));
        const response: ResponseApi = {
            message: "cloture de l enchere",
            data: {},
        }
        res.status(200).send(response);
    } else {
        res.status(405).send({error: "Ce n est pas votre enchere"})
        return
    }
}