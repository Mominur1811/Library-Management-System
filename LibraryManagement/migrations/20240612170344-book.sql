
-- +migrate Up
CREATE TABLE IF NOT EXISTs book(
    Id SERIAL PRIMARY KEY,
    Book VARCHAR NOT NULL,
    Category VARCHAR NOT NULL,
    author VARCHAR NOT NULL,
    Summary VARCHAR NOT NULL,
    Quantity int NOT,
    Available int NOT
);


-- +migrate Down
DROP TABLE IF EXISTS book