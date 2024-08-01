package web

import (
	"fmt"
	"log"
	"net/http"
	"notification/config"
	"notification/web/middlewire"
	"sync"
)

func StartServer(wg *sync.WaitGroup) {
	mux := http.NewServeMux()

	manager := middlewire.NewManager()
	InitRoutes(mux, manager)
	handler := middlewire.EnableCors(mux)

	wg.Add(1)
	go func() {
		defer wg.Done()
		fmt.Println("Server Started")
		addr := fmt.Sprintf(":%d", config.GetConfig().HttpPort)
		fmt.Println(config.GetConfig().HttpPort)
		if err := http.ListenAndServe(addr, handler); err != nil {
			log.Fatal(err)
		}
	}()

}
