
-- +migrate Up
CREATE TABLE IF NOT EXISTS book (
    Id SERIAL PRIMARY KEY,
    Book VARCHAR NOT NULL,
    Category VARCHAR NOT NULL,
    Author VARCHAR NOT NULL,
    Summary VARCHAR NOT NULL,
    Quantity INT NOT NULL,
    Available INT NOT NULL,
    Created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- +migrate Down
DROP TABLE IF EXISTS book;