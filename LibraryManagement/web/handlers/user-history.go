package handlers

import (
	"librarymanagement/db"
	"librarymanagement/web/middlewire"
	"librarymanagement/web/utils"
	"net/http"
)

type HistoryFilterParam struct {
	SearchVal     string `json:"search"`
	RequestStatus string `json:"category"`
}

func UserHistory(w http.ResponseWriter, r *http.Request) {

	userId, err := middlewire.GetUserId(r)
	if err != nil {
		utils.SendError(w, http.StatusExpectationFailed, err.Error())
		return
	}

	historyFilterParam := FetchHistoryParam(r)

	history, err := db.GetBookRequestRepo().GetUserHistory(userId, historyFilterParam.SearchVal, historyFilterParam.RequestStatus)
	if err != nil {
		utils.SendError(w, http.StatusNotAcceptable, err.Error())
		return
	}

	utils.SendData(w, history)
}

func FetchHistoryParam(r *http.Request) *HistoryFilterParam {

	var temp HistoryFilterParam
	temp.SearchVal = r.URL.Query().Get("search")
	temp.RequestStatus = r.URL.Query().Get("category")
	return &temp
}
