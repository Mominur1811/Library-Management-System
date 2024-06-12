package middlewire

import (
	"context"
	"fmt"
	"librarymanagement/config"
	"librarymanagement/web/utils"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type UserEmail string

const userEmail = UserEmail("userEmail")

type AuthClaims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

func unauthorizedResponse(w http.ResponseWriter) {
	utils.SendError(w, http.StatusUnauthorized, "Unauthorized")
}

func Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// collect token from header
		header := r.Header.Get("authorization")
		tokenStr := ""
		// collect token from query
		if len(header) == 0 {
			tokenStr = r.URL.Query().Get("auth")
		} else {
			tokens := strings.Split(header, " ")
			if len(tokens) != 2 {
				unauthorizedResponse(w)
				return
			}
			tokenStr = tokens[1]
		}

		// parse jwt
		var claims = AuthClaims{}
		fmt.Println(tokenStr, config.GetConfig().JwtSecretKey)
		token, err := jwt.ParseWithClaims(
			tokenStr,
			&claims,
			func(t *jwt.Token) (interface{}, error) {
				return []byte(config.GetConfig().JwtSecretKey), nil
			},
		)
		fmt.Println(claims)
		if err != nil {
			fmt.Println("Heeloo")
			unauthorizedResponse(w)
			return
		}

		// get user id from token
		if !token.Valid {
			unauthorizedResponse(w)
			return
		}

		// set user id in the context
		wrappedRequest := r.WithContext(context.WithValue(r.Context(), userEmail, claims.Email))
		next.ServeHTTP(w, wrappedRequest)
	})
}

func GetUserId(r *http.Request) (int, error) {
	userIdVal := r.Context().Value(userEmail)
	userId, ok := userIdVal.(int)
	if !ok {
		return 0, fmt.Errorf("Unauthorized")
	}
	return userId, nil
}
