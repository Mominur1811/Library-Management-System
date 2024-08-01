package rabbitmq

import (
	"fmt"
	"log"
	"log/slog"
	"sync"
	"time"

	rmq "github.com/rabbitmq/amqp091-go"
)

type ConnectCallback func(*rmq.Channel)

type DisconnectCallback func()

type FailedToConnectCallback func()

type ConnectionManager struct {
	host                     string
	reconnectDelay           time.Duration
	connection               *rmq.Connection
	channel                  *rmq.Channel
	mutex                    sync.RWMutex
	failedToConnect          chan bool
	connected                chan bool
	disconnected             chan bool
	connectCallbacks         []ConnectCallback
	disconnectCallbacks      []DisconnectCallback
	failedToConnectCallbacks []FailedToConnectCallback
	stop                     chan bool
}

func NewConnectionManager(host string, reconnectDelay time.Duration) *ConnectionManager {
	return &ConnectionManager{
		host:                     host,
		reconnectDelay:           reconnectDelay,
		failedToConnect:          make(chan bool),
		connected:                make(chan bool),
		disconnected:             make(chan bool),
		connectCallbacks:         make([]ConnectCallback, 0),
		disconnectCallbacks:      make([]DisconnectCallback, 0),
		failedToConnectCallbacks: make([]FailedToConnectCallback, 0),
		stop:                     make(chan bool),
	}
}

func (cm *ConnectionManager) tryConnect(wait bool) {
	// synchronize
	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	// wait before trying to connect
	if wait {
		slog.Info(fmt.Sprintf(
			"Waiting %v seconds before connecting",
			cm.reconnectDelay.Seconds(),
		))
		time.Sleep(cm.reconnectDelay)
	}

	// try to connect
	conn, err := rmq.Dial(cm.host)
	if err != nil {
		slog.Error(fmt.Sprintf("Failed to connect. error: %v", err))

		// failed to connect, should tell the monitorer
		cm.failedToConnect <- true
		return
	}

	// try to create channel
	channel, err := conn.Channel()
	if err != nil {
		slog.Error(fmt.Sprintf("Failed to create channel. error: %v", err))

		// close the established connection
		conn.Close()

		// failed to create channel, should tell the monitorer
		cm.failedToConnect <- true
		return
	}

	// close previous channel if any
	if cm.channel != nil {
		slog.Info("Clearing previous channel")
		cm.channel.Close()
		cm.channel = nil
	}

	// close previous connection if any
	if cm.connection != nil {
		slog.Info("Clearing previous connection")
		cm.connection.Close()
		cm.connection = nil
	}

	// assign new connection and channel
	cm.connection = conn
	cm.channel = channel

	// let the monitorer know that connection was
	// successfully established
	cm.connected <- true
}

func (cm *ConnectionManager) listenCloseEvents() {
	// get close notifier channels
	cm.mutex.RLock()
	if cm.connection == nil || cm.channel == nil {
		slog.Info(fmt.Sprintf(
			"Connection or channel is nil. conn: %v, chan: %v",
			cm.connection,
			cm.channel,
		))

		cm.mutex.RUnlock()

		return
	}
	connStop := cm.connection.NotifyClose(make(chan *rmq.Error))
	channelStop := cm.channel.NotifyClose(make(chan *rmq.Error))
	cm.mutex.RUnlock()

	// monitor for close events forever
	slog.Info("Monitoring for connection close")
	for connStop != nil && channelStop != nil {
		select {
		case err, _ := <-connStop:
			slog.Error(fmt.Sprintf("Connection closed. error: %v", err))
			connStop = nil

		case err, _ := <-channelStop:
			slog.Error(fmt.Sprintf("Channel closed. error: %v", err))
			channelStop = nil
		}
	}

	// notify the monitorer
	cm.disconnected <- true
}

func (cm *ConnectionManager) OnConnect(cb ConnectCallback) {
	cm.connectCallbacks = append(cm.connectCallbacks, cb)
}

func (cm *ConnectionManager) OnDisconnect(cb DisconnectCallback) {
	cm.disconnectCallbacks = append(cm.disconnectCallbacks, cb)
}

func (cm *ConnectionManager) OnFailedToConnect(cb FailedToConnectCallback) {
	cm.failedToConnectCallbacks = append(cm.failedToConnectCallbacks, cb)
}

func (cm *ConnectionManager) getChannel() *rmq.Channel {
	return cm.channel
}

func (cm *ConnectionManager) cleanup() {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	if cm.channel != nil {
		slog.Info("Closing channel")
		cm.channel.Close()
		cm.channel = nil
	}

	if cm.connection != nil {
		slog.Info("Closing connection")
		cm.connection.Close()
		cm.connection = nil
	}
}

func (cm *ConnectionManager) startMonitoring() {
ForLoop:
	for {
		select {
		case <-cm.stop:
			slog.Info("Stopping monitoring.")

			// trigger a disconnect to all connection users
			for _, cb := range cm.disconnectCallbacks {
				cb()
			}

			// clean up
			cm.cleanup()

			// exit
			break ForLoop

		case <-cm.failedToConnect:
			slog.Info("Failed to connect. Reconnecting...")

			// trigger a failure to all connection users
			for _, cb := range cm.failedToConnectCallbacks {
				cb()
			}

			// do cleanup
			cm.cleanup()

			// schedule a reconnect
			log.Println("207")
			go cm.tryConnect(true)

		case <-cm.disconnected:
			slog.Info("Disconnected. Reconnecting...")

			// trigger a disconnect to all connection users
			for _, cb := range cm.disconnectCallbacks {
				cb()
			}

			// do a cleanup
			cm.cleanup()

			// schedule a reconnect
			log.Println("222")
			go cm.tryConnect(true)

		case <-cm.connected:
			slog.Info("Connected.")

			// attach listener to different channels first
			go cm.listenCloseEvents()

			// trigger a connect to all connection users
			cm.mutex.RLock()
			for _, cb := range cm.connectCallbacks {
				cb(cm.channel)
			}
			cm.mutex.RUnlock()
		}
	}
}

func (cm *ConnectionManager) Start() {
	// attach listener to different channels first
	go cm.startMonitoring()

	// try to connect for the first time
	cm.tryConnect(false)
}

func (cm *ConnectionManager) Stop() {
	// let the monitorer know that we are asked to stop
	// monitoring so that no more auto-reconnect gets
	// triggered
	cm.stop <- true
}
