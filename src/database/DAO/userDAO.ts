import {UserInterface} from "../../interfaces/userInterface.js";
import {pool} from "../connection.js";
import type {ResultSetHeader, RowDataPacket} from "mysql2";
import {randomBytes, scrypt, timingSafeEqual} from "node:crypto";
import {promisify} from "node:util";
import {CardInterface} from "../../interfaces/cardInterface.js";

const scryptAsync = promisify(scrypt);

interface UserResponse extends RowDataPacket {
    id: number;
    username: string;
    password: string;
    token?: string;
    last_booster?: Date;
    currency?: number;
}

interface UserWithCards extends RowDataPacket {
    id: number;
    username: string;
    password: string;
    last_booster?: Date;
    currency?: number;
    card_id: number;
    card_name: string;
    card_rarity: string;
    quantity: number;
}

interface UserCardResponse extends RowDataPacket {
    user_id: number;
    card_id: number;
    quantity: number;
}

export class UserDAO {

    private async hashPassword(password: string): Promise<string> {
        const salt = randomBytes(16).toString("hex");

        const derivedKey = await scryptAsync(password, salt, 64) as Buffer;

        return `${salt}:${derivedKey.toString("hex")}`;
    }

    private async verifyPassword(password: string, storedPassword: string): Promise<boolean> {
        const [salt, storedHash] = storedPassword.split(":");

        if (!salt || !storedHash) return false;

        const derivedKey = await scryptAsync(password, salt, 64) as Buffer;

        const storedBuffer = Buffer.from(storedHash, "hex");

        if (derivedKey.length !== storedBuffer.length) return false;

        return timingSafeEqual(derivedKey, storedBuffer);
    }

    async createUser(username: string, password: string): Promise<UserInterface> {
        const hashedPassword = await this.hashPassword(password);
        const [result] = await pool.execute<ResultSetHeader>(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, hashedPassword]
        );
        return {
            id: result.insertId,
            username,
            password: hashedPassword,
            collection: [],
        };
    }

    async findByUsername(username: string): Promise<UserInterface | undefined> {
        const [user] = await pool.execute<UserResponse[]>(
            "SELECT * FROM users WHERE username = ? LIMIT 1",
            [username],
        );
        if (user.length === 0) {
            return undefined;
        }
        return {
            id: user[0].id,
            username: user[0].username,
            password: user[0].password,
            collection: [],
        };
    }

    async login(username: string, password: string): Promise<UserInterface | false> {
        const [users] = await pool.execute<UserResponse[]>(
            "SELECT * FROM users WHERE username = ? LIMIT 1",
            [username],
        );
        if (users.length === 0) {
            return false;
        }
        const user = users[0];
        const isValid = await this.verifyPassword(password, user.password);
        if (!isValid) {
            return false;
        }
        const userToken = crypto.randomUUID()
        await pool.execute<UserResponse[]>(
            "UPDATE users SET token = ? WHERE id = ? LIMIT 1",
            [userToken, user.id],
        );
        return {
            id: user.id,
            username: user.username,
            password: user.password,
            token: userToken,
            collection: [],
        };
    }

    async verifyToken(token: string): Promise<number | false> {
        const [user] = await pool.execute<UserWithCards[]>(
            "SELECT * from users WHERE token = ? LIMIT 1",
            [token],
        );
        if (user.length === 0) {
            return false;
        }
        return user[0].id;
    }

    async findById(id: number): Promise<UserInterface | undefined> {
        const [rows] = await pool.execute<UserWithCards[]>(
            "SELECT u.*, c.id card_id, c.name card_name, c.rarity card_rarity, uc.quantity FROM users u LEFT JOIN user_cards uc on uc.user_id = u.id LEFT JOIN cards c on c.id = uc.card_id WHERE u.id = ?",
            [id],
        );
        if (rows.length === 0) {
            return undefined;
        }
        const cards: { id: number; name: string; qt: number }[] = [];
        rows.forEach((row) => {
            if (row.card_id != null) {
                cards.push({
                    id: row.card_id,
                    name: row.card_name,
                    qt: row.quantity,
                })
            }
        })
        return {
            id: rows[0].id,
            username: rows[0].username,
            password: rows[0].password,
            collection: cards,
            lastBooster: rows[0].last_booster,
            currency: rows[0].currency,
        }
    }

    async update(user: UserInterface): Promise<UserInterface> {
        user.password = await this.hashPassword(user.password);
        await pool.execute(
            "UPDATE users SET username = ?, password = ?, currency = ? WHERE id = ?",
            [user.username, user.password, user.currency ?? 0, user.id],
        )
        const queries = user.collection.map(card => {
                if (!card.qt) {
                    pool.execute(
                        "DELETE FROM user_cards WHERE user_id = ? AND card_id = ?",
                        [user.id, card.id]
                    )
                } else {
                    pool.execute(
                        "UPDATE user_cards SET quantity = ? WHERE user_id = ? AND card_id = ?",
                        [card.qt, user.id, card.id]
                    )
                }
            }
        );
        await Promise.all(queries);
        return user;
    }

    async logout(userId: number): Promise<void> {
        await pool.execute(
            "UPDATE users SET token = ? WHERE id = ?",
            [null, userId]
        );
    }

    async addBooster(userId: number, cards: CardInterface[]): Promise<void> {
        //a voir si y a pas moyen d opti ca avec un Promise.all et faire une requete avant qui met en forme un tableau
        for (const card of cards) {
            const [row] = await pool.execute<UserCardResponse[]>(
                "select * from user_cards where user_id = ? AND card_id = ?",
                [userId, card.id],
            )
            if (row.length === 0) {
                await pool.execute(
                    "INSERT INTO user_cards (user_id, card_id, quantity) VALUES (?, ?, 1)",
                    [userId, card.id],
                )
            } else {
                await pool.execute(
                    "UPDATE user_cards SET quantity = ? WHERE user_id = ? AND card_id = ?",
                    [row[0].quantity + 1, userId, card.id],
                )
            }
        }
        await pool.execute(
            "UPDATE users SET last_booster = ? WHERE id = ?",
            [new Date(), userId]
        )
    }
}