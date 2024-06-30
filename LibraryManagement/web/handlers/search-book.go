package handlers

import (
	"fmt"
	"librarymanagement/db"
	"librarymanagement/web/utils"
	"net/http"
)

const (
	defaultSortBy    = "created_at"
	defaultSortOrder = "desc"
)

func SearchBook(w http.ResponseWriter, r *http.Request) {

	param := utils.GetPaginationParams(r, defaultSortBy, defaultSortOrder)
	header := r.Header.Get("authorization")
	fmt.Println(header)

	booklist, err := db.GetBookRepo().GetBookList(param)
	if err != nil {
		utils.SendError(w, http.StatusFailedDependency, err.Error())
		return
	}

	utils.SendPage(w, booklist)

}
