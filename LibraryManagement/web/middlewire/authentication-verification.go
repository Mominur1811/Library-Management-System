package middlewire

import (
	"fmt"
	"librarymanagement/config"
	"librarymanagement/web/utils"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type UserId string

const userId = UserId("userId")

type AuthClaims struct {
	Id int `json:"Id"`
	jwt.RegisteredClaims
}

func unauthorizedResponse(w http.ResponseWriter) {
	utils.SendError(w, http.StatusUnauthorized, "Unauthorized")
}

func Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		str := r.Header.Get("authorization")
		tokenStr, err := ExtractToken(str)
		if err != nil {
			unauthorizedResponse(w)
			return
		}

		// parse jwt
		token, err := jwt.ParseWithClaims(
			tokenStr,
			&AuthClaims{},
			func(t *jwt.Token) (interface{}, error) {
				return []byte(config.GetConfig().JwtSecretKey), nil
			},
		)
		if err != nil || !token.Valid {
			unauthorizedResponse(w)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func ExtractToken(header string) (string, error) {
	if len(header) == 0 {
		return "", fmt.Errorf("access token is null ")
	}

	//Check and Extract jwt part
	tokens := strings.Split(header, " ")
	if len(tokens) != 2 {
		return "", fmt.Errorf("access token structure is invalid ")
	}
	return tokens[1], nil

}

func GetUserId(r *http.Request) (*int, error) {

	str := r.Header.Get("authorization")
	tokenStr, err := ExtractToken(str)
	if err != nil {
		return nil, fmt.Errorf("error fetching jwt token")
	}
	
	var claims AuthClaims
	// parse jwt
	_, err = jwt.ParseWithClaims(
		tokenStr,
		&claims,
		func(t *jwt.Token) (interface{}, error) {
			return []byte(config.GetConfig().JwtSecretKey), nil
		},
	)
	if err != nil {
		return nil, fmt.Errorf("error claming info from token")
	}

	return &claims.Id, nil
}
