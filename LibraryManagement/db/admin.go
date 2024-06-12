package db

import (
	"librarymanagement/logger"
	"log/slog"
)

type Admin struct {
	Email    string `json:"email"      validate:"required,email"  db:"email"`
	Password string `json:"password"   validate:"required"        db:"password"`
}

type AdminRepo struct {
	Table string
}

var adminRepo *AdminRepo

func InitAdminRepo() {
	adminRepo = &AdminRepo{Table: "admin"}
}

func GetAdminRepo() *AdminRepo {
	return adminRepo
}

func (r *AdminRepo) RegisterUser(newAdmin *Admin) (*Admin, error) {

	column := map[string]interface{}{
		"password": newAdmin.Password,
		"email":    newAdmin.Email,
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
