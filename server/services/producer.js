const amqp = require("amqplib");
const { saveMessageToRedis, deleteFromRedis, getAllMessageFromRedis } = require('./rabbit');
class Producer {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.intervalId = null;
  }

  static async getInstance() {
    if (!this.instance) {
      this.instance = new Producer();
      await this.instance.connect();
    }
    return this.instance;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(process.env.RABBIT_URL);
      this.channel = await this.connection.createChannel();
      console.log('connection established');

      clearInterval(this.intervalId);
      this.retryFailedOperations();


      this.connection.on('close', () => {
        this.channel = null;
        this.intervalId = null;
        this.connect();
        console.error('connection closed');
      });

      this.channel.on('close', () => {
        this.channel = null;
        this.intervalId = null;
        this.connect();
        console.error('Channel closed');
      });

    } catch (error) {
      console.log('Retry connecting to RabbitMQ');
      if (!this.intervalId) {
        this.intervalId = setInterval(() => {
          this.connect();
        }, 6000);
      }
    }
  }


  async publishMessage(routingKey, message) {
    if (!this.channel) {
      message.routingKey=routingKey
      saveMessageToRedis(message);
      await this.connect();
    }
    else {
      const exchangeName = 'notifyExchange';
      await this.channel.assertExchange(exchangeName, 'direct');

      const notifyDetails = {
        logType: routingKey,
        message: message,
        dateTime: new Date(),
      };

      await this.channel.publish(
        exchangeName,
        routingKey,
        Buffer.from(JSON.stringify(notifyDetails))
      );

      console.log(`The new ${routingKey} log is sent to exchange ${exchangeName} ${JSON.stringify(message)}`);
      return true;
    }
  }

  async retryFailedOperations() {
    const failedOperations = await getAllMessageFromRedis();

    for (const operation in failedOperations) {
      try {
        const message = JSON.parse(failedOperations[operation]);
        const success = await this.publishMessage(message.routingKey, {
          email: message.email,
          status: message.status
        });
        if (success) {
          deleteFromRedis(operation);
        }
      } catch (error) {
        console.error(`Error retrying operation: ${error.message}`);
      }
    }

  }

}

module.exports = Producer;
