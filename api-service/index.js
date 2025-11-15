import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import { app } from "./src/app.js";
import { connectRabbitMQ } from "./src/rabbitmq/index.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    // Connect to RabbitMQ *after* DB connection
    return connectRabbitMQ();
  })
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`🚀 Server is running at port : ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.error("MONGO db or RABBITMQ connection failed !!! ", err);
    process.exit(1);
  });
