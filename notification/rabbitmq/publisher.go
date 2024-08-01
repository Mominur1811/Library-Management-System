package rabbitmq

import (
	"context"
	"fmt"
	"log/slog"
	"notification/logger"
	"sync"
	"time"

	rmq "github.com/rabbitmq/amqp091-go"
)

type Publisher struct {
	channel  *rmq.Channel
	messages []Message
	mutex    sync.RWMutex
	stop     chan bool
}

func NewPublisher() *Publisher {
	return &Publisher{
		messages: make([]Message, 0),
		stop:     make(chan bool),
	}
}

// Queue msg into failed messages
// Locks failed messages for write
func (p *Publisher) queue(msg Message) {
	p.mutex.Lock()
	defer p.mutex.Unlock()
	p.messages = append(p.messages, msg)
}

func (p *Publisher) Publish(msg Message) {
	if err := p.tryPublish(msg); err != nil {
		// queue message
		p.queue(msg)
	}
}

func (p *Publisher) tryPublish(msg Message) error {
	// if nil channel queue the message
	if p.channel == nil {
		err := fmt.Errorf("channel is nil. queueing message. route: %s", msg.RoutingKey)
		slog.Error(err.Error())
		return err
	}

	if p.channel.IsClosed() {
		err := fmt.Errorf("channel is closed. queueing message. route: %s", msg.RoutingKey)
		slog.Error(err.Error())
		return err
	}

	if err := p.channel.ExchangeDeclare(
		msg.Exchange, // name
		"topic",      // kind
		true,         // durable
		false,        // autoDelete
		false,        // internal
		false,        // noWait
		nil,          // args
	); err != nil {
		slog.Error(fmt.Sprintf(
			"Failed to declare exchange. queueing message. route: %s",
			msg.RoutingKey,
		))
		return err
	}

	rmqMsg := rmq.Publishing{
		DeliveryMode: rmq.Persistent,
		ContentType:  "text/plain",
		Timestamp:    time.Now(),
		Body:         msg.Message,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := p.channel.PublishWithContext(
		ctx,
		msg.Exchange,
		msg.RoutingKey,
		false,
		false,
		rmqMsg,
	); err != nil {
		slog.Error(fmt.Sprintf("Failed to publish. route: %s, error: %v", msg.RoutingKey, err))
		return err
	}

	slog.Info(
		fmt.Sprintf("Successfully published. route: %s", msg.RoutingKey),
		logger.Extra(string(msg.Message)),
	)
	return nil
}

func (p *Publisher) HandleConnect(channel *rmq.Channel) {
	p.channel = channel

	// retry messages that were not sent
	slog.Info(fmt.Sprintf("Retrying %v messages...", len(p.messages)))
	p.mutex.Lock()
	defer p.mutex.Unlock()
	failed := make([]Message, 0)
	for _, msg := range p.messages {
		if err := p.tryPublish(msg); err != nil {
			// re-queue
			failed = append(failed, msg)
		}
	}

	// reset with failed messages
	slog.Info(fmt.Sprintf("Retry failed for %v messages. Requeueing...", len(failed)))
	p.messages = failed
}

func (p *Publisher) HandleDisconnect() {
	p.channel = nil
	slog.Info("Channel is nil now")
}

func (p *Publisher) Stop() {
	p.stop <- true
}

func (p *Publisher) Start() {
	// start a background routine which will
	// periodically check for leftover messages and
	// try to resend them
	go p.processFailedMessages()
}

func (p *Publisher) processFailedMessages() {

ForLoop:
	for {
		select {
		case <-p.stop:
			slog.Info(fmt.Sprintf(
				"Stopping to process failed messages. Left messages: %v",
				len(p.messages),
			))
			break ForLoop

		case <-time.After(time.Duration(5) * time.Minute):
			slog.Info(fmt.Sprintf(
				"Retrying failed messages. Left messages: %v",
				len(p.messages),
			), logger.Extra(p.messages))

			// lock message queue and try again
			p.mutex.Lock()
			failed := make([]Message, 0)
			for _, msg := range p.messages {
				if err := p.tryPublish(msg); err != nil {
					// requeue
					failed = append(failed, msg)
				}
			}

			// reset with failed messages
			slog.Info(fmt.Sprintf("Retry failed for %v messages. Requeueing...", len(failed)), logger.Extra(failed))
			p.messages = failed
			p.mutex.Unlock()
		}
	}
}
