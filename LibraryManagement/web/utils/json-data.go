package utils

import "net/http"

func SendData(w http.ResponseWriter, info interface{}, data interface{}) {
	SendJson(w, http.StatusOK, map[string]interface{}{
		"status":  true,
		"message": info,
		"data":    data,
	})
}
