package rabbitmq

import (
	"fmt"
	"log"
	"log/slog"
	"sync"

	rmq "github.com/rabbitmq/amqp091-go"
)

type Consumer func([]byte) error

type ConsumerOption struct {
	Exchange   string
	RoutingKey string
	Queue      string
	Consumer   Consumer
	stop       chan bool
}

type ConsumerManager struct {
	consumers []*ConsumerOption
	mutex     sync.RWMutex
	channel   *rmq.Channel
}

func NewConsumerManager() *ConsumerManager {
	return &ConsumerManager{
		consumers: make([]*ConsumerOption, 0),
	}
}

func (cm *ConsumerManager) Add(opts ConsumerOption) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	optsWithStopChannel := opts

	// add the consumer to registry
	cm.consumers = append(cm.consumers, &optsWithStopChannel)
	// try to start consumer if we have an active channel
	go cm.tryConsume(&optsWithStopChannel)
}

func (cm *ConsumerManager) prepareQueue(opts *ConsumerOption) error {
	// declare exchange
	if err := cm.channel.ExchangeDeclare(
		opts.Exchange, // exchange
		"topic",       // kind
		true,          // durable
		false,         // autoDelete
		false,         // internal
		false,         // nowait
		nil,           // args
	); err != nil {
		slog.Error(fmt.Sprintf(
			"Failed to declare exchange. exchange: %s, route: %s, queue: %s, error: %v",
			opts.Exchange,
			opts.RoutingKey,
			opts.Queue,
			err,
		))
		return nil
	}

	// declare queue
	if _, err := cm.channel.QueueDeclare(
		opts.Queue, // name
		true,       // durable
		false,      // autoDelete
		false,      // exclusive
		false,      // nowait
		nil,        // args
	); err != nil {
		slog.Error(fmt.Sprintf(
			"Failed to declare queue. exchange: %s, route: %s, queue: %s, error: %v",
			opts.Exchange,
			opts.RoutingKey,
			opts.Queue,
			err,
		))
		return nil
	}

	// bind queue
	if err := cm.channel.QueueBind(
		opts.Queue,      // name
		opts.RoutingKey, // key
		opts.Exchange,   // exchange
		false,           // noWait
		nil,             // args
	); err != nil {
		slog.Error(fmt.Sprintf(
			"Failed to bind queue. exchange: %s, route: %s, queue: %s, error: %v",
			opts.Exchange,
			opts.RoutingKey,
			opts.Queue,
			err,
		))
		return err
	}

	return nil
}

func (cm *ConsumerManager) tryConsume(opts *ConsumerOption) {
	// if no channel return
	if cm.channel == nil {
		slog.Error(fmt.Sprintf("No channel. queue: %s", opts.Queue))
		return
	}

	// if the channel is closed return
	if cm.channel.IsClosed() {
		return
	}

	// prepare queue, routing key and exchange
	if err := cm.prepareQueue(opts); err != nil {
		slog.Error(fmt.Sprintf(
			"Failed to prepare for consumption. queue: %s, error: %v",
			opts.Queue,
			err,
		))
		return
	}

	// create new buffered stop channel everytime
	opts.stop = make(chan bool, 1)

	// start consuming
	msgChan, err := cm.channel.Consume(
		opts.Queue, // queue name
		"",         // consumer name
		false,      // autoAck
		false,      // exclusive
		false,      // noLocal (unsupported)
		true,       // noWait
		nil,        // args
	)

	if err != nil {
		slog.Error(fmt.Sprintf(
			"Failed to start consumption. queue: %s, error: %v",
			opts.Queue,
			err,
		))
		return
	}

	// keep consuming until asked to stop
	slog.Info(fmt.Sprintf("Consuming from queue: %s", opts.Queue))
	slog.Info("I am called")
ForLoop:
	for {
		select {
		case <-opts.stop:
			slog.Info(fmt.Sprintf("Stopping consumer. queue: %s", opts.Queue))
			break ForLoop

		case msg, ok := <-msgChan:
			if !ok {
				slog.Info(fmt.Sprintf("Message channel is closed. queue: %s", opts.Queue))
				break ForLoop
			}

			// try processing the message
			err := opts.Consumer(msg.Body)
			if err == nil {
				// acknowledge the message
				msg.Ack(false)
			}
		}
	}
}

func (cm *ConsumerManager) HandleConnect(channel *rmq.Channel) {
	cm.channel = channel

	// not stopping already running, consumers
	// because, connect will only trigger if channel was
	// close previously and new channel is created, so
	// the already running consumers will eventually stop

	// try running registered consummers
	slog.Info("Trying to run consumers")
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()
	for _, consumer := range cm.consumers {
		go cm.tryConsume(consumer)
		log.Println("-------handle connect-------")
	}
}

func (cm *ConsumerManager) HandleDisconnect() {
	cm.channel = nil

	// stop all consumers
	// can deadlock if one or more consumer is not running
	slog.Info("Stopping all consumers")
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()
	for _, consumer := range cm.consumers {
		if consumer.stop != nil {
			consumer.stop <- true
		}
	}
	slog.Info("All consumers are asked to stop")
}

func GetPattern() string {
	var i string

	fmt.Print("Type a number: ")
	fmt.Scan(&i)
	return i
}
