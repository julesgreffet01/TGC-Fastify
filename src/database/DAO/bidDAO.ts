import {pool} from "../connection.js";
import type {RowDataPacket} from "mysql2";
import {fdatasync} from "node:fs";
import {EnchereInterface} from "../../interfaces/EnchereInterface.js";

interface BidResponse extends RowDataPacket {
    id: number;
    end_dates: Date | null;
    bid: number;
    bidder_id: number;
    seller_id: number;
    card_id: number;
}

export class BidDAO {
    async getAllValid(): Promise<EnchereInterface[]> {
        const [rows] = await pool.execute<BidResponse[]>(
            "SELECT * FROM bids where end_date IS NULL",
        )
        if (rows.length === 0) {
            return [];
        }
        return rows.map(row => {
            return {
                id: row.id,
                endDate: row.end_dates,
                cardId: row.card_id,
                sellerId: row.seller_id,
                bidderId: row.bidder_id,
                bid: row.bid,
            }
        })
    }

    async create(enchere: EnchereInterface): Promise<EnchereInterface> {
        await pool.execute(
            "INSERT INTO bids (bid, seller_id, card_id) values (?, ?, ?)",
            [enchere.bid, enchere.sellerId, enchere.cardId]
        )
        return enchere;
    }

    async findById(enchereId: number): Promise<EnchereInterface | undefined> {
        const [row] = await pool.execute<BidResponse[]>(
            "SELECT * FROM bids where end_date IS NULL AND id = ? LIMIT 1",
            [enchereId]
        )
        const bidRes = row[0];
        if (!bidRes.id) {
            return undefined;
        }
        return {
            id: bidRes.id,
            endDate: bidRes.end_dates,
            cardId: bidRes.card_id,
            sellerId: bidRes.seller_id,
            bidderId: bidRes.bidder_id,
            bid: bidRes.bid,
        }
    }

    async update(enchere: EnchereInterface): Promise<void> {
        await pool.execute(
            "UPDATE bids SET end_date = ?, bidder_id = ?, bid = ? WHERE id = ?",
            [enchere.endDate, enchere.bidderId, enchere.bid, enchere.id],
        )
    }
}