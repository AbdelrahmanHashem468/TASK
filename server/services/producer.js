const amqp = require("amqplib");

class Producer {
  channel;

  async createChannel() {
    const connection = await amqp.connect(process.env.RABBIT_URL);
    this.channel = await connection.createChannel();
  }

  async publishMessage(routingKey, message) {
    if (!this.channel) {
      await this.createChannel();
    }

    const exchangeName = 'notifyExchange';
    await this.channel.assertExchange(exchangeName, "direct");

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

    console.log(
      `The new ${routingKey} log is sent to exchange ${exchangeName} ${JSON.stringify(message)}`
    );
  }
}

module.exports = Producer;