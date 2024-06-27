package handlers

import (
	"encoding/json"
	"fmt"
	"librarymanagement/db"
	"librarymanagement/logger"
	"librarymanagement/web/middlewire"
	"librarymanagement/web/utils"
	"log/slog"
	"net/http"
)

func RequestBook(w http.ResponseWriter, r *http.Request) {

	var requestBook db.BookRequest
	if err := json.NewDecoder(r.Body).Decode(&requestBook); err != nil {
		slog.Error("Failed to decode new user data", logger.Extra(map[string]any{
			"error":   err.Error(),
			"payload": requestBook,
		}))
		utils.SendError(w, http.StatusPreconditionFailed, err.Error())
		return
	}

	rId, _ := middlewire.GetUserId(r)
	requestBook.ReaderId = *rId
	fmt.Println(requestBook)

	if err := utils.ValidateStruct(requestBook); err != nil {
		slog.Error("Failed to validate request data", logger.Extra(map[string]any{
			"error":   err.Error(),
			"payload": requestBook,
		}))
		utils.SendError(w, http.StatusExpectationFailed, err.Error())
		return
	}

	var pendingRequest *db.BookRequest
	var err error

	if pendingRequest, err = db.GetBookRequestRepo().PushBookRequest(&requestBook); err != nil {
		utils.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendData(w, pendingRequest)

}
