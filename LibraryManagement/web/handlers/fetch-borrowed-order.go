package handlers

import (
	"librarymanagement/db"
	"librarymanagement/web/utils"
	"net/http"
)

func FetchBorrowedBook(w http.ResponseWriter, r *http.Request) {

	borrowList, err := db.GetBookRequestRepo().GetBorrowedBooks()
	if err != nil {
		utils.SendError(w, http.StatusNotAcceptable, err.Error())
		return
	}

	utils.SendData(w, borrowList)
}
