package main

import (
	"notification/app"
)

func main() {

	//GetUser()
	app := app.NewApplication()
	app.Init()
	app.Run()
	app.Wait()
	app.CleanUp()

}
