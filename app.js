import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "helper-utils-library";
import notificationRouter from "./src/routes/notification.routes.js";
const { logger, errorHandler } = pkg;

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3006;

app.get("/api/notification/health", (req, res) => {
    res.status(200).json({ status: "running", success: true });
});

app.use("/api/notification", notificationRouter);

app.listen(PORT, () => {
    logger.info(`Notification Service is running on port ${PORT}`);
});

app.use(errorHandler);
