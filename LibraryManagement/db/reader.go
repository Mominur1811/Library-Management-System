package db

import (
	"librarymanagement/logger"
	"log/slog"
)

type Reader struct {
	Name     string `db:"name"     validate:"required,alpha"          json:"name" `
	Email    string `db:"email"    validate:"required,email"          json:"email"`
	Password string `db:"password" validate:"required"                json:"password"`
}

type ReaderRepo struct {
	Table string
}

var readerRepo *ReaderRepo

func InitReaderRepo() {
	readerRepo = &ReaderRepo{Table: "reader"}
}

func GetReaderRepo() *ReaderRepo {
	return readerRepo
}

func (r *ReaderRepo) RegisterUser(newReader *Reader) (*Reader, error) {

	column := map[string]interface{}{
		"name":     newReader.Name,
		"password": newReader.Password,
		"email":    newReader.Email,
	}
	var columns []string
	var values []any
	for columnName, columnValue := range column {
		columns = append(columns, columnName)
		values = append(values, columnValue)
	}

	qry, args, err := GetQueryBuilder().
		Insert(r.Table).
		Columns(columns...).
		Suffix(`
			RETURNING 
			name,
			password,
			email
		`).
		Values(values...).
		ToSql()
	if err != nil {
		slog.Error(
			"Failed to create new register query",
			logger.Extra(map[string]any{
				"error": err.Error(),
				"query": qry,
				"args":  args,
			}),
		)
		return nil, err
	}

	// Execute the SQL query and get the result
	var insertedReader Reader
	err = GetReadDB().QueryRow(qry, args...).Scan(&insertedReader.Name, &insertedReader.Password, &insertedReader.Email)
	if err != nil {
		slog.Error(
			"Failed to execute insert query",
			logger.Extra(map[string]interface{}{
				"error": err.Error(),
				"query": qry,
				"args":  args,
			}),
		)
		return nil, err
	}

	return &insertedReader, nil

}
