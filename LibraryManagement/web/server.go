package web

import (
	"fmt"
	"librarymanagement/config"
	"librarymanagement/web/middlewire"
	"librarymanagement/web/swagger"
	"log"
	"net/http"

	"sync"
)

func StartServer(wg *sync.WaitGroup) {
	mux := http.NewServeMux()

	manager := middlewire.NewManager()
	InitRoutes(mux, manager)
	handler := middlewire.EnableCors(mux)

	swagger.SetupSwagger(mux, manager)
	wg.Add(1)
	go func() {
		defer wg.Done()
		fmt.Println("Server Started")
		addr := fmt.Sprintf(":%d", config.GetConfig().HttpPort)
		if err := http.ListenAndServe(addr, handler); err != nil {
			log.Fatal(err)
		}
	}()

}
