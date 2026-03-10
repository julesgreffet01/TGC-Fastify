import type {RowDataPacket} from "mysql2";
import {pool} from "../connection.js";
import {CardInterface} from "../../interfaces/cardInterface.js";

interface CardResponse extends RowDataPacket {
    id: number;
    name: string;
    rarity: string;
}


export class CardDAO {
    async getAll(): Promise<CardInterface[]>{
        const [rows] = await pool.execute<CardResponse[]>(
            "SELECT * FROM cards ORDER BY id",
        );
        if(rows.length === 0){
            return [];
        }
        return rows.map(row => {
            return {
                id: row.id,
                name: row.name,
                rarity: row.rarity,
            }
        });
    }


}