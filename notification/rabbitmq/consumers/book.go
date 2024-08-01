package consumers

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"notification/logger"
)

func AddBook(data []byte) error {

	var result interface{}

	err := json.Unmarshal(data, &result)
	if err != nil {
		slog.Error("Failed to unmarshal", logger.Extra(map[string]any{
			"error":   err.Error(),
			"payload": err,
		}))
	}
	fmt.Println(result)
	return nil
}
