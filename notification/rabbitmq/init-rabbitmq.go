package rabbitmq

func InitRabbitMQ() {
	if client == nil {
		client = NewClient()
		client.Start()
	}
}

func CloseRabbitMQ() {
	if client != nil {
		client.Stop()
	}
}
