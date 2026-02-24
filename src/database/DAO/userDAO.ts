import {UserInterface} from "../../interfaces/userInterface.js";
import {pool} from "../connection.js";
import {RowDataPacket} from "mysql2";
import {createHash} from "node:crypto";
import { ResultSetHeader } from "mysql2";

interface UserResponse extends RowDataPacket {
    id: number;
    username: string;
    password: string;
    token?: string;
    last_booster?: Date;
    currency?: number;
}

//testé et approuvé pour l instant
export class UserDAO {

    private hash;

    constructor() {
        this.hash = createHash("sha256");
    }

    async getAllUsers(): Promise<UserInterface[]> {
        const [rows] = await pool.query<UserResponse[]>(
            "SELECT * FROM users"
        );
        const res: UserInterface[] = [];
        for (const row of rows) {
            const user = {
                id: row.id,
                username: row.username,
                password: row.password,
                collection: [],
                token: row.token,
                lastBooster: row.last_booster,
                currency: row.currency,
            }
            res.push(user);
        }
        return res;
    }

    async createUser(username: string, password: string): Promise<UserInterface> {
        const hashedPassword = this.hash
            .update(password)
            .digest("hex");
        const [result] = await pool.execute<ResultSetHeader>(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, hashedPassword]
        );
        return {
            username,
            id: result.insertId,
            password,
            collection: [],
        };
    }
}