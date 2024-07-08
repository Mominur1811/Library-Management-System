package handlers

import (
	"fmt"
	"librarymanagement/db"
	"librarymanagement/web/utils"
	"net/http"
)

func FetchBookRequest(w http.ResponseWriter, r *http.Request) {

	param := utils.GetPaginationParams(r, defaultSortBy, defaultSortOrder)
	fmt.Println(param)
	requestList, err := db.GetBookRequestRepo().GetUnapprovedRequest()
	if err != nil {
		utils.SendError(w, http.StatusNotAcceptable, err.Error())
		return
	}
	utils.SendData(w, requestList)
}
