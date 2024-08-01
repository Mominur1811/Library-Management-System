package web

import (
	"net/http"
	"notification/web/handlers"
	"notification/web/middlewire"
)

func InitRoutes(mux *http.ServeMux, manager *middlewire.Manager) {
	mux.Handle(
		"GET /rabbit-call",
		manager.With(
			http.HandlerFunc(handlers.RabbitCall),
		),
	)
}
