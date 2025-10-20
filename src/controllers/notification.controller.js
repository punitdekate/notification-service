"use strict";
import nodemailer from "nodemailer";
import pkg from "helper-utils-library";
import { serviceErrors } from "../../errorMessages.js";
import twilio from "twilio";
const { logger, failureResponse, BadRequest, InternalServerError, successResponse } = pkg;

export default class NotificationController {
    async sendEmail(req, res, next) {
        const { to = "", subject = "", text = "", html = "", cc = [], bcc = [] } = req.body || {};

        const required = ["to", "subject"];
        for (const field of required) {
            if (!req.body?.[field]) {
                return failureResponse(res, new BadRequest(`Field '${field}' is required.`), 400);
            }
        }
        if (!process.env.GMAIL_NOTIFICATION_USERNAME || !process.env.GMAIL_NOTIFICATION_SECRET) {
            return failureResponse(res, new InternalServerError(serviceErrors.EMAIL_SERVICE_NOT_CONFIGURED), 500);
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_NOTIFICATION_USERNAME,
                pass: process.env.GMAIL_NOTIFICATION_SECRET
            }
        });

        const options = {
            from: process.env.GMAIL_NOTIFICATION_USERNAME,
            to: Array.isArray(to) ? to.join(",") : to,
            cc: Array.isArray(cc) ? cc.join(",") : cc,
            bcc: Array.isArray(bcc) ? bcc.join(",") : bcc,
            subject: subject,
            text: text,
            html: html
        };

        try {
            const info = await transporter.sendMail(options);
            logger.info("Email sent:", info.messageId);

            return successResponse(res, { messageId: info.messageId, response: info.response }, 200);
        } catch (err) {
            logger.error(`Error sending email: ${err.message}`);
            next(new InternalServerError(serviceErrors.EMAIL_SENDING_FAILED));
        }
    }

    async sendSms(req, res, next) {
        try {
            const { to, message } = req.body;

            const required = ["to", "message"];
            for (const field of required) {
                if (!req.body[field]) {
                    return failureResponse(res, new BadRequest(`Field '${field}' is required.`), 400);
                }
            }

            const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

            const response = await client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to // E.g. '+9198xxxxxxxx'
            });

            logger.info("SMS sent:", response.sid);

            return successResponse(res, { sid: response.sid, message: "message sent successfully" }, 200);
        } catch (err) {
            logger.error(`Error sending SMS: ${err.message}`);
            next(err);
        }
    }
}
