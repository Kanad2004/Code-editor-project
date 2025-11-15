import amqplib from "amqplib";
import { SUBMISSION_QUEUE } from "../constants.js";

let channel;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqplib.connect(process.env.RABBITMQ_URI);
    channel = await connection.createChannel();
    await channel.assertQueue(SUBMISSION_QUEUE, { durable: true });
    console.log("RabbitMQ connected and queue asserted");
  } catch (error) {
    console.error("RABBITMQ connection FAILED", error);
    throw error;
  }
};

const publishToQueue = async (queueName, message) => {
  if (!channel) {
    throw new Error("RabbitMQ channel is not established.");
  }
  try {
    channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(message)),
      { persistent: true } // Makes sure message survives broker restart
    );
  } catch (error) {
    console.error(`Failed to publish message to queue ${queueName}`, error);
  }
};

export { connectRabbitMQ, publishToQueue };