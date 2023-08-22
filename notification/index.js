const amqp = require("amqplib");
const sendNotification = require('./mail');
class Consummer {
  channel;

  async createChannel() {
    const connection = await amqp.connect(process.env.RABBIT_URL);
    this.channel = await connection.createChannel();
  }

  async consumeMessages() {
    if (!this.channel) {
      await this.createChannel();
    }

    const exchangeName = 'notifyExchange';
    await this.channel.assertExchange(exchangeName, "direct");

    const q = await this.channel.assertQueue("notifyQueue");

    await this.channel.bindQueue(q.queue, "notifyExchange", "mail");

    await this.channel.consume(q.queue, (msg) => {
        const data = JSON.parse(msg.content);
        console.log(data);
        const email = data.message.email;
        const message = `Your Request has been ${data.message.status}` ;
        sendNotification(email,message);
        this.channel.ack(msg);
      });

  }
}

const consummer = new Consummer();
consummer.consumeMessages();