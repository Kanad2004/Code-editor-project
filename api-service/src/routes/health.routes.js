import { Router } from "express";
import mongoose from "mongoose";
import { getConnection } from "../rabbitmq/index.js";

const router = Router();

router.get("/", async (req, res) => {
  const health = {
    status: "UP",
    timestamp: new Date().toISOString(),
    services: {
      database: "DOWN",
      rabbitmq: "DOWN"
    }
  };

  // Check MongoDB
  try {
    if (mongoose.connection.readyState === 1) {
      health.services.database = "UP";
    }
  } catch (error) {
    health.services.database = "DOWN";
  }

  // Check RabbitMQ
  try {
    const connection = getConnection();
    if (connection && connection._connectPromise) {
      health.services.rabbitmq = "UP";
    }
  } catch (error) {
    health.services.rabbitmq = "DOWN";
  }

  // Set overall status
  const allServicesUp = Object.values(health.services).every(s => s === "UP");
  health.status = allServicesUp ? "UP" : "DEGRADED";

  const statusCode = allServicesUp ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
