import type {UserInterface} from "../interfaces/userInterface.js";
import fs from "node:fs";
import {ResponseApi} from "../interfaces/responseApi.js";
import {FastifyReply, FastifyRequest} from "fastify";

export function getAll(req: FastifyRequest, res: FastifyReply) {
    const cards: UserInterface[] = JSON.parse(fs.readFileSync('data/cards.json', 'utf-8'));
    const response: ResponseApi = {
        message: "voici toutes les cartes disponible",
        data: cards,
    }
    return res.status(200).send(response);
}