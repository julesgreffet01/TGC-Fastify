export interface UserInterface {
    id: number;
    username: string;
    password: string;
    collection: {id: number, name: string, qt: number}[],
    token?: string;
    lastBooster?: Date;
    currency?: number;
}