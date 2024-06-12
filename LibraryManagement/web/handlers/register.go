package handlers

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"librarymanagement/db"
	"librarymanagement/logger"
	"librarymanagement/web/utils"
	"log/slog"
	"net/http"
	"net/smtp"

	"text/template"
	"time"
)

func Register(w http.ResponseWriter, r *http.Request) {

	var newReader db.Reader
	if err := json.NewDecoder(r.Body).Decode(&newReader); err != nil {
		slog.Error("Failed to decode new user data", logger.Extra(map[string]any{
			"error":   err.Error(),
			"payload": newReader,
		}))
		utils.SendError(w, http.StatusPreconditionFailed, err.Error())
		return
	}

	if err := utils.ValidateStruct(newReader); err != nil {
		slog.Error("Failed to validate new user data", logger.Extra(map[string]any{
			"error":   err.Error(),
			"payload": newReader,
		}))
		utils.SendError(w, http.StatusExpectationFailed, err.Error())
		return
	}

	newReader.Password = hashPassword(newReader.Password)
	var insertedReader *db.Reader
	var err error

	if insertedReader, err = db.GetReaderRepo().RegisterUser(&newReader); err != nil {
		utils.SendError(w, http.StatusExpectationFailed, err.Error())
		return
	}

	//sendConfirmationEmail(insertedVendor)

	utils.SendData(w, "", insertedReader)

}

func hashPassword(pass string) string {

	h := sha256.New()
	h.Write([]byte(pass))
	hashValue := h.Sum(nil)
	return hex.EncodeToString(hashValue)
}

func sendConfirmationEmail(user *db.Vendor) error {
	from := "****************"
	password := "*********"

	to := []string{
		user.V_Email,
	}

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	t, err := template.ParseFiles("/home/mominur/ecommerce/html/signup-email.html")
	if err != nil {
		slog.Error("Failed to validate new user data", logger.Extra(map[string]any{
			"error":   err.Error(),
			"payload": user,
		}))
		return err
	}

	otp := EncodeToString(6)
	var body bytes.Buffer
	mimeHeaders := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	body.Write([]byte(fmt.Sprintf("Subject: Confirm SignUP \n%s\n\n", mimeHeaders)))

	t.Execute(&body, struct {
		Otp string
	}{
		Otp: otp,
	})
	auth := smtp.PlainAuth("", from, password, smtpHost)

	err = smtp.SendMail(smtpHost+":"+smtpPort, auth, from, to, body.Bytes())
	if err != nil {
		slog.Error("Failed to Send Email", logger.Extra(map[string]any{
			"error":   err.Error(),
			"payload": user,
		}))
		return err
	}

	err = db.GetRedisClient().Set(context.Background(), user.V_Email, otp, 5*time.Minute).Err()
	if err != nil {
		slog.Error("Failed to save otp in redis", logger.Extra(map[string]any{
			"error":   err.Error(),
			"payload": user,
		}))
	}

	return err

}

func EncodeToString(max int) string {
	b := make([]byte, max)
	n, err := io.ReadAtLeast(rand.Reader, b, max)
	if n != max {
		panic(err)
	}
	for i := 0; i < len(b); i++ {
		b[i] = table[int(b[i])%len(table)]
	}
	return string(b)
}

var table = [...]byte{'1', '2', '3', '4', '5', '6', '7', '8', '9', '0'}
