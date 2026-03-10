CREATE TABLE users
(
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(50)  NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    token        VARCHAR(255),
    last_booster DATETIME,
    currency     INT UNSIGNED NOT NULL DEFAULT 0,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cards
(
    id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name   VARCHAR(100) NOT NULL,
    rarity VARCHAR(50)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_cards
(
    user_id  INT UNSIGNED NOT NULL,
    card_id  INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,

    PRIMARY KEY (user_id, card_id),

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
            REFERENCES users (id)
            ON DELETE CASCADE,

    CONSTRAINT fk_card
        FOREIGN KEY (card_id)
            REFERENCES cards (id)
            ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bids
(
    id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    end_date  TIMESTAMP,
    bid       INT UNSIGNED,
    bidder_id INT UNSIGNED NULL,
    seller_id INT UNSIGNED,
    card_id   INT UNSIGNED,

    CONSTRAINT fk_bid_bidder
        FOREIGN KEY (bidder_id)
            REFERENCES users (id)
            ON DELETE SET NULL,
    CONSTRAINT fk_bid_seller
        FOREIGN KEY (seller_id)
            REFERENCES users (id)
            ON DELETE CASCADE,
    CONSTRAINT fk_bid_card
        FOREIGN KEY (card_id)
            REFERENCES cards (id)
            ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;