import {UserInterface} from "../../interfaces/userInterface.js";
import {pool} from "../connection.js";
import {RowDataPacket} from "mysql2";

interface UserResponse extends RowDataPacket {
    id: number;
    username: string;
    password: string;
    collection: {id: number, name: string, qt: number}[],
    token?: string;
    lastBooster?: Date;
    currency?: number;
}

export class UserDAO {
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
                collection: row.collection,
                token: row.token,
                lastBooster: row.lastBooster,
                currency: row.currency,
            }
            res.push(user);
        }
        return res;
    }
}