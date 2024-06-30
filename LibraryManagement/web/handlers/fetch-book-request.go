package handlers

import (
	"encoding/json"
	"librarymanagement/db"
	"librarymanagement/logger"
	"librarymanagement/web/utils"
	"log/slog"
	"net/http"
)

type ReqId struct {
	Request_Id int `json:"request_id" validate:"required"`
	Book_Id    int `json:"book_id"    validate:"required"`
}

func FetchBookRequest(w http.ResponseWriter, r *http.Request) {

	requestList, err := db.GetBookRequestRepo().GetUnapprovedRequest()
	if err != nil {
		utils.SendError(w, http.StatusNotAcceptable, err.Error())
		return
	}

	utils.SendData(w, requestList)
}

func ApprovedBookRequest(w http.ResponseWriter, r *http.Request) {

	var reqId ReqId
	if err := json.NewDecoder(r.Body).Decode(&reqId); err != nil {
		slog.Error("Failed to decode request id", logger.Extra(map[string]any{
			"error":   err.Error(),
			"payload": reqId,
		}))
		utils.SendError(w, http.StatusPreconditionFailed, err.Error())
		return
	}

	if err := utils.ValidateStruct(reqId); err != nil {
		slog.Error("Failed to validate new book data", logger.Extra(map[string]any{
			"error":   err.Error(),
			"payload": reqId,
		}))
		utils.SendError(w, http.StatusExpectationFailed, err.Error())
		return
	}

	if err := db.GetBookRequestRepo().AcceptRequest(reqId.Request_Id); err != nil {
		utils.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if err := db.GetBookRepo().UpdateBookAvailability(reqId.Book_Id); err != nil {
		utils.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendData(w, "Updated Successfully")
}
