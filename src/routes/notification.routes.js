import express from "express";
import NotificationController from "../controllers/notification.controller.js";
import authMiddleware from "../middlewares/auth.js";
const notificationRouter = express.Router();

const notificationController = new NotificationController();

notificationRouter.post("/send-email", authMiddleware, (req, res, next) => notificationController.sendEmail(req, res, next));
notificationRouter.post("/send-sms", authMiddleware, (req, res, next) => notificationController.sendSms(req, res, next));

export default notificationRouter;
