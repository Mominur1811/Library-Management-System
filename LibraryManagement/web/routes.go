package web

import (
	"librarymanagement/web/handlers"
	"librarymanagement/web/middlewire"
	"net/http"
)

func InitRoutes(mux *http.ServeMux, manager *middlewire.Manager) {
	mux.Handle(
		"POST /reader/register",
		manager.With(
			http.HandlerFunc(handlers.RegisterReader),
		),
	)
	mux.Handle(
		"POST /reader/login",
		manager.With(
			http.HandlerFunc(handlers.LoginReader),
		),
	)

	mux.Handle(
		"GET /admin/unapproveduser",
		manager.With(
			http.HandlerFunc(handlers.GetUnapprovedUser),
		),
	)

	mux.Handle(
		"GET /admin/fetchuser",
		manager.With(
			http.HandlerFunc(handlers.FetchUser),
		),
	)

	mux.Handle(
		"GET /admin/fetchadmin",
		manager.With(
			http.HandlerFunc(handlers.FetchAdmin),
		),
	)

	mux.Handle(
		"DELETE /admin/deleteadmin",
		manager.With(
			http.HandlerFunc(handlers.DeleteAdmin),
		),
	)

	mux.Handle(
		"POST /admin/acceptapproval",
		manager.With(
			http.HandlerFunc(handlers.ApprovedUser),
		),
	)

	mux.Handle(
		"POST /admin/login",
		manager.With(
			http.HandlerFunc(handlers.LoginAdmin),
		),
	)

	mux.Handle(
		"POST /admin/addadmin",
		manager.With(
			http.HandlerFunc(handlers.AddAdmin),
		),
	)

	mux.Handle(
		"POST /admin/addbook",
		manager.With(
			http.HandlerFunc(handlers.AddBook),
		),
	)

	mux.Handle(
		"PUT /admin/updatebook/{id}",
		manager.With(
			http.HandlerFunc(handlers.UpdateBook),
		),
	)

	mux.Handle(
		"DELETE /admin/deletebook",
		manager.With(
			http.HandlerFunc(handlers.DeleteBook),
		),
	)

	mux.Handle(
		"GET /reader/searchbook",
		manager.With(
			http.HandlerFunc(handlers.SearchBook), middlewire.AuthenticateUser,
		),
	)

	mux.Handle(
		"GET /admin/searchbook",
		manager.With(
			http.HandlerFunc(handlers.SearchBook), middlewire.AuthenticateAdmin,
		),
	)

	mux.Handle(
		"POST /reader/bookrequest",
		manager.With(
			http.HandlerFunc(handlers.BorrowRequestBook),
		),
	)

	mux.Handle(
		"GET /admin/borrowedbook",
		manager.With(
			http.HandlerFunc(handlers.FetchBorrowStatus), ///checking this now
		),
	)

	mux.Handle(
		"PATCH /admin/approvedbookrequest",
		manager.With(
			http.HandlerFunc(handlers.ApprovedBookRequest),
		),
	)

	mux.Handle(
		"PATCH /admin/rejectborrowreq",
		manager.With(
			http.HandlerFunc(handlers.RejectRequest),
		),
	)

	mux.Handle(
		"GET /reader/history",
		manager.With(
			http.HandlerFunc(handlers.UserHistory), middlewire.AuthenticateUser,
		),
	)

	mux.Handle(
		"PATCH /reader/updatereadprogress",
		manager.With(
			http.HandlerFunc(handlers.UserReadProgressUpdate), middlewire.AuthenticateUser,
		),
	)

	mux.Handle(
		"PATCH /reader/returnbook",
		manager.With(
			http.HandlerFunc(handlers.ReturnBook), middlewire.AuthenticateUser,
		),
	)
}
