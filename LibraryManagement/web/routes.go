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
		"POST /admin/acceptapproval",
		manager.With(
			http.HandlerFunc(handlers.ApprovedUser),
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
		"GET /reader/searchbook",
		manager.With(
			http.HandlerFunc(handlers.SearchBook), middlewire.Authenticate,
		),
	)

	mux.Handle(
		"POST /reader/bookrequest",
		manager.With(
			http.HandlerFunc(handlers.RequestBook),
		),
	)

	mux.Handle(
		"GET /admin/fetchbookrequest",
		manager.With(
			http.HandlerFunc(handlers.FetchBookRequest),
		),
	)

	mux.Handle(
		"GET /admin/approvedbookrequest",
		manager.With(
			http.HandlerFunc(handlers.ApprovedBookRequest),
		),
	)

}
