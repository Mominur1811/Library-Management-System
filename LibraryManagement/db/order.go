package db

import (
	"fmt"
	"librarymanagement/logger"
	"log/slog"
	"time"

	sq "github.com/Masterminds/squirrel"
)

type BookRequest struct {
	RequestId     *int
	BookId        int        `db:"bookid"          json:"bookid"`
	ReaderId      int        `db:"readerid"        json:"readerid"`
	IssuedAt      *time.Time `db:"issued_at"       json:"issued_at"`
	Read_Page     int        `db:"read_page"       json:"read_page"`
	RequestStatus string     `db:"request_status"  json:"request_status"`
}

type Request struct {
	BookTitle      string     `db:"book_title"       json:"book_title"`
	BookAvailable  int        `db:"book_available"   json:"book_available"`
	ReaderUsername string     `db:"reader_username"  json:"reader_name"`
	RequestId      *int       `db:"request_id"`
	BookID         int        `db:"bookid"           json:"book_id"`
	ReaderID       int        `db:"readerid"         json:"reader_id"`
	IssuedAt       *time.Time `db:"issued_at"        json:"issued_at"`
	RequestStatus  string     `db:"request_status"   json:"request_status"`
}

type UserBookHistory struct {
	RequestId     *int       `db:"request_id"`
	BookTitle     string     `db:"book_title"       json:"book_title"`
	Read_Page     int        `db:"read_page"        json:"read_page"`
	Total_page    int        `db:"total_page"       json:"total_page"`
	RequestStatus string     `db:"request_status"   json:"request_status"`
	IssuedAt      *time.Time `db:"issued_at"        json:"issued_at"`
	Request_dat   *time.Time `db:"created_at"       json:"created_at"`
}

type BookRequestRepo struct {
	Table string
}

var bookRequestRepo *BookRequestRepo

func InitBookReqeustRepo() {
	bookRequestRepo = &BookRequestRepo{Table: "book_request"}
}

func GetBookRequestRepo() *BookRequestRepo {
	return bookRequestRepo
}

func (r *BookRequestRepo) PushBookRequest(requestBook *BookRequest) (*BookRequest, error) {

	column := map[string]interface{}{
		"bookid":         requestBook.BookId,
		"readerid":       requestBook.ReaderId,
		"request_status": requestBook.RequestStatus,
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
			request_id, 		
			bookid,
			readerid,
			issued_at,
			request_status
		`).
		Values(values...).
		ToSql()
	if err != nil {
		slog.Error(
			"Failed to create new book request query",
			logger.Extra(map[string]any{
				"error": err.Error(),
				"query": qry,
				"args":  args,
			}),
		)
		return nil, err
	}

	var insRequest BookRequest
	err = GetReadDB().QueryRow(qry, args...).Scan(&insRequest.RequestId, &insRequest.BookId, &insRequest.ReaderId, &insRequest.IssuedAt, &insRequest.RequestStatus)
	if err != nil {
		slog.Error(
			"Failed to execute book request query",
			logger.Extra(map[string]interface{}{
				"error": err.Error(),
				"query": qry,
				"args":  args,
			}),
		)
		return nil, err
	}
	return &insRequest, nil
}

func (r *BookRequestRepo) GetUnapprovedRequest() ([]*Request, error) {

	qry, args, err := GetQueryBuilder().Select("b.title AS book_title", "b.available AS book_available", "r.name AS reader_username", "rq.request_id", "rq.bookid", "rq.readerid", "rq.issued_at", "rq.request_status").
		From("book_request rq").
		Join("book b ON rq.bookid = b.id").
		Join("reader r ON rq.readerid = r.id").
		Where(sq.Eq{"rq.request_status": "pending"}).ToSql()

	if err != nil {
		slog.Error(
			"Failed to create Get Unapproved request query",
			logger.Extra(map[string]any{
				"error": err.Error(),
				"query": qry,
				"args":  args,
			}),
		)
		return nil, err
	}

	upapprovedRequest := []*Request{}
	err = GetReadDB().Select(&upapprovedRequest, qry, args...)
	if err != nil {
		slog.Error(
			"Failed to Fetch upapproved user",
			logger.Extra(map[string]any{
				"error": err.Error(),
				"query": qry,
				"args":  args,
			}),
		)
		return nil, err
	}

	return upapprovedRequest, nil
}

func (r *BookRequestRepo) AcceptRequest(reqId int) error {

	updateQry, args, err := GetQueryBuilder().Update(r.Table).
		Set("request_status", "Approved").
		Set("issued_at", time.Now()).
		Where(sq.Eq{"request_id": reqId}).
		ToSql()
	if err != nil {
		slog.Error(
			"Failed to create update query for request status",
			logger.Extra(map[string]any{
				"error": err.Error(),
				"query": updateQry,
				"args":  args,
			}),
		)
		return err
	}

	// Execute the update query
	_, err = GetReadDB().Exec(updateQry, args...)
	if err != nil {
		slog.Error(
			"Failed to update of readers active status",
			logger.Extra(map[string]any{
				"error": err.Error(),
				"query": updateQry,
				"args":  args,
			}),
		)
		return err
	}

	return nil
}

func (r *BookRequestRepo) RejectBorrowRequest(reqId int) error {

	updateQry, args, err := GetQueryBuilder().Update(r.Table).
		Set("request_status", "Rejected").
		Set("issued_at", time.Now()).
		Where(sq.Eq{"request_id": reqId}).
		ToSql()
	if err != nil {
		slog.Error(
			"Failed to create update query for request status",
			logger.Extra(map[string]any{
				"error": err.Error(),
				"query": updateQry,
				"args":  args,
			}),
		)
		return err
	}

	// Execute the update query
	_, err = GetReadDB().Exec(updateQry, args...)
	if err != nil {
		slog.Error(
			"Failed to update of readers active status",
			logger.Extra(map[string]any{
				"error": err.Error(),
				"query": updateQry,
				"args":  args,
			}),
		)
		return err
	}

	return nil
}

func (r *BookRequestRepo) GetBorrowedBooks() ([]*Request, error) {

	qry, args, err := GetQueryBuilder().Select("b.title AS book_title", "b.available AS book_available", "r.name AS reader_username", "rq.request_id", "rq.bookid", "rq.readerid", "rq.issued_at", "rq.request_status").
		From("book_request rq").
		Join("book b ON rq.bookid = b.id").
		Join("reader r ON rq.readerid = r.id").
		Where(sq.Eq{"rq.request_status": "Approved"}).ToSql()

	if err != nil {
		slog.Error(
			"Failed to create Get Unapproved request query",
			logger.Extra(map[string]any{
				"error": err.Error(),
				"query": qry,
				"args":  args,
			}),
		)
		return nil, err
	}

	borrowedBooks := []*Request{}
	err = GetReadDB().Select(&borrowedBooks, qry, args...)
	if err != nil {
		slog.Error(
			"Failed to Fetch upapproved user",
			logger.Extra(map[string]any{
				"error": err.Error(),
				"query": qry,
				"args":  args,
			}),
		)
		return nil, err
	}

	return borrowedBooks, nil
}

func (r *BookRequestRepo) GetUserHistory(uId *int) ([]*UserBookHistory, error) {

	qry, args, err := GetQueryBuilder().Select("rq.request_id", "b.title AS book_title", "rq.read_page", "b.total_page", "rq.request_status", "rq.issued_at", "rq.created_at").
		From("book_request rq").
		Join("book b ON rq.bookid = b.id").
		Where(sq.Eq{"rq.readerid": *uId}).ToSql()

	if err != nil {
		slog.Error(
			"Failed to create Get User history query",
			logger.Extra(map[string]any{
				"error": err.Error(),
				"query": qry,
				"args":  args,
			}),
		)
		return nil, err
	}

	history := []*UserBookHistory{}
	err = GetReadDB().Select(&history, qry, args...)
	if err != nil {
		slog.Error(
			"Failed to Fetch upapproved user",
			logger.Extra(map[string]any{
				"error": err.Error(),
				"query": qry,
				"args":  args,
			}),
		)
		return nil, err
	}

	return history, nil
}

func (r *BookRequestRepo) UpdateUserReadProgress(reqId int, read_today int) error {

	updateQry, args, err := GetQueryBuilder().Update(r.Table).
		Set("read_page", sq.Expr(fmt.Sprintf("read_page + %d", read_today))).
		Where(sq.Eq{"request_id": reqId}).
		ToSql()
	if err != nil {
		slog.Error(
			"Failed to create update query for request status",
			logger.Extra(map[string]any{
				"error": err.Error(),
				"query": updateQry,
				"args":  args,
			}),
		)
		return err
	}

	// Execute the update query
	_, err = GetReadDB().Exec(updateQry, args...)
	if err != nil {
		slog.Error(
			"Failed to update of readers active status",
			logger.Extra(map[string]any{
				"error": err.Error(),
				"query": updateQry,
				"args":  args,
			}),
		)
		return err
	}

	return nil

}
