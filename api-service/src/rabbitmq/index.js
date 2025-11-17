import amqp from "amqplib";

let connection = null;
let channel = null;

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

export const connectRabbitMQ = async (retries = 0) => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Assert queues exist
    await channel.assertQueue(process.env.SUBMISSION_QUEUE, { durable: true });
    await channel.assertQueue(process.env.TEST_QUEUE, { durable: true });
    
    console.log("✅ RabbitMQ connected");

    // Handle connection errors
    connection.on('error', (err) => {
      console.error('❌ RabbitMQ connection error:', err);
      if (retries < MAX_RETRIES) {
        console.log(`Retrying RabbitMQ connection (${retries + 1}/${MAX_RETRIES})...`);
        setTimeout(() => connectRabbitMQ(retries + 1), RETRY_DELAY);
      }
    });

    connection.on('close', () => {
      console.log('⚠️ RabbitMQ connection closed');
    });

  } catch (error) {
    console.error("❌ RabbitMQ connection failed:", error.message);
    
    if (retries < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY / 1000}s... (${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectRabbitMQ(retries + 1);
    }
    
    throw new Error('Failed to connect to RabbitMQ after multiple retries');
  }
};

export const publishToQueue = async (queueName, message) => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    
    const sent = channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    
    if (!sent) {
      throw new Error('Failed to send message to queue');
    }
    
    console.log(`📤 Published to ${queueName}:`, message.submission_id || message);
  } catch (error) {
    console.error('❌ Failed to publish to queue:', error);
    throw error;
  }
};

export const getChannel = () => channel;
export const getConnection = () => connection;
