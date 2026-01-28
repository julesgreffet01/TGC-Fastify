import type {UserInterface} from "../interfaces/userInterface.js";
import fs from "node:fs";
import {ResponseApi} from "../interfaces/responseApi.js";
import {FastifyReply, FastifyRequest} from "fastify";
import {CardInterface} from "../interfaces/cardInterface.js";

export function getAll(req: FastifyRequest, res: FastifyReply) {
    const cards: CardInterface[] = JSON.parse(fs.readFileSync('data/cards.json', 'utf-8'));
    const response: ResponseApi = {
        message: "voici toutes les cartes disponible",
        data: cards,
    }
    return res.status(200).send(response);
}

export function openBooster(req: FastifyRequest, res: FastifyReply) {
    const users: UserInterface[] = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
    const user = users.find(user => user.token === req.headers.token);
    if (!user) {
        res.status(403).send({error: "token invalid"})
        return;
    }
    if(user.lastBooster) {
        const diffMs = Date.now() - new Date(user.lastBooster).getTime()
        if (diffMs <= 5 * 60 * 1000) {
            res.status(403).send({error: "trop tot mon chef"})
            return;
        }
    }
    const cards: CardInterface[] = JSON.parse(fs.readFileSync('data/cards.json', 'utf-8'));

    const nbCard = 5
    const cardsBooster: CardInterface[] = []
    for (let ii = 0; ii<nbCard; ii++) {
        const chance = Math.floor(Math.random() * 101);
        let rarete: string = "";
        if( chance <= 80 ) {
            rarete = "common"
        } else if (chance <= 95 ) {
            rarete = "rare"
        } else {
            rarete = "legendary"
        }
        const cardsPossibles = cards.filter(card => card.rarity === rarete);
        if(!cardsPossibles) {
            throw new Error('c est pas normale')
        }
        const indexId = Math.floor(Math.random() * cardsPossibles.length);
        const cardChoice = cardsPossibles[indexId];
        cardsBooster.push(cardChoice);
        const existant = user.collection.find(row => row.id === cardChoice.id)
        if(existant) {
            existant.qt ++
        } else {
            user.collection.push({id: cardChoice.id, qt: 1, name: cardChoice.name});
        }
    }
    user.lastBooster = new Date();
    fs.writeFileSync('data/users.json', JSON.stringify(users));
    const response: ResponseApi = {
        message: "vous avez ouvert votre booster",
        data: cardsBooster,
    }
    return res.status(200).send(response);
}

export function convert(req: FastifyRequest<{Headers: {token: string}, Params: {idCard: number}}>, res: FastifyReply) {
    const users: UserInterface[] = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
    const user = users.find(user => user.token === req.headers.token);
    if (!user) {
        res.status(403).send({error: "token invalid"})
        return;
    }
    const cards: CardInterface[] = JSON.parse(fs.readFileSync('data/cards.json', 'utf-8'));
    const card = cards.find(card => card.id === Number(req.params.idCard));
    const collectionRow = user.collection.find(row => row.id === Number(req.params.idCard))
    console.log(collectionRow);
    console.log(card);
    if(!card || !collectionRow) {
        res.status(401).send({error: "l id de la carte n est pas valid (pas de carte trouve) ou l utilisateur n as pas la carte"})
        return;
    }
    if(collectionRow.qt == 1) {
        res.status(401).send({error: "vous n 'avez qu une fois cette carte"})
        return;
    }
    collectionRow.qt --
    if(card.rarity === "common") {
        user.currency ? user.currency += 10 : user.currency = 10;
    } else if (card.rarity === "rare") {
        user.currency ? user.currency += 20 : user.currency = 20;
    } else {
        user.currency ? user.currency += 40 : user.currency = 40;
    }
    fs.writeFileSync('data/users.json', JSON.stringify(users));
    const response: ResponseApi = {
        message: "la conversion a été faite",
        data: {},
    }
    res.status(200).send({response});
}