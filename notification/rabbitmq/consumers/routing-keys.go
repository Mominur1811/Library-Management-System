package consumers

import "fmt"

const BookAddRoutingKey1 = `add_book_successor.1`
const BookAddRoutingKey2 = `add_book_successor.2`

func QueueName(routingKey string) string {
	return fmt.Sprintf("%s%s:queue", `momin-notification:`, routingKey)
}

// --------------- Book Add --------------//
func UserQueueName1() string {
	return QueueName(BookAddRoutingKey1)
}

func UserQueueName2() string {
	return QueueName(BookAddRoutingKey2)
}
