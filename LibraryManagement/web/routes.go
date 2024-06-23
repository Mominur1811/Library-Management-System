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
		"GET /admin/unapproveduser",
		manager.With(
			http.HandlerFunc(handlers.GetUnapprovedUser),
		),
	)

	mux.Handle(
		"POST /admin/acceptapproval",
		manager.With(
			http.HandlerFunc(handlers.ApprovedUser),
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
			http.HandlerFunc(handlers.SearchBook),
		),
	)

}
