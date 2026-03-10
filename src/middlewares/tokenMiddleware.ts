import {FastifyRequest, FastifyReply} from "fastify";
import {UserDAO} from "../database/DAO/userDAO.js";

export async function tokenMiddleware(req: FastifyRequest<{ Headers: {token: string} }>, res: FastifyReply) {
    const token = req.headers.token;

    if (!token) {
        return res.code(401).send({error: "Y a pas de token"});
    }
    const userDao = new UserDAO();

    const id = await userDao.verifyToken(token);
    if (!id) {
        return res.code(401).send({error: "token invalide"});
    }
    req.user = {
        id
    };
}