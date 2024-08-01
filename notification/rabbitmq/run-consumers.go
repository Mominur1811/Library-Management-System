package rabbitmq

import (
	"log/slog"
	"notification/rabbitmq/consumers"
	"os"
)

func RunConsumers() {
	client := GetClient()
	if client == nil {
		slog.Error("No client")
		os.Exit(1)
		return
	}

	// -------------------------------------- Book Add --------------------------------
	client.AddConsumer(
		ConsumerOption{Exchange: ExchangeName,
			RoutingKey: consumers.BookAddRoutingKey1,
			Queue:      consumers.UserQueueName1(),
			Consumer:   consumers.AddBook,   /// temp := consumers.AddBook()
		},
	)


	//  ----------------------------- Book ADD other excnhageee


	client.AddConsumer(
		ConsumerOption{Exchange: ExchangeName,
			RoutingKey: consumers.BookAddRoutingKey2,
			Queue:      consumers.UserQueueName2(),
			Consumer:   consumers.AddBook,   /// temp := consumers.AddBook()
		},
	)
}
