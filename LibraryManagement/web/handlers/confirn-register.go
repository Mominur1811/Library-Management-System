package handlers

import (
	"net/http"
)

func AcceptRegistration(w http.ResponseWriter, r *http.Request) {

	var email string
	if err := json.(r.body).decode(&email); err != nil {

	}
}
