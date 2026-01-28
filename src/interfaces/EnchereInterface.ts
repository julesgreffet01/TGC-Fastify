export interface EnchereInterface {
    id: number;
    card_id: number;
    seller_id: number;
    end_date: Date | null;
    bidder_id: number | null;
    bid: number;
}