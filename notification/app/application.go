package app

import (
	"notification/config"
	"notification/db"
	"notification/rabbitmq"
	"notification/web"
	"sync"
)

type Application struct {
	wg sync.WaitGroup
}

func NewApplication() *Application {
	return &Application{}
}

func (app *Application) Init() {
	config.LoadConfig()
	rabbitmq.InitRabbitMQ()
	db.InitDB()

	//time.Sleep(10 * time.Microsecond)
}

func (app *Application) Run() {
	rabbitmq.RunConsumers()
	web.StartServer(&app.wg)
}

func (app *Application) Wait() {
	app.wg.Wait()
}

func (app *Application) CleanUp() {
	db.CloseDB()
	rabbitmq.CloseRabbitMQ()
}
