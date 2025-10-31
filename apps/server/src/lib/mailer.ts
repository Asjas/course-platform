import config from "../config.ts";
import nodemailer, { type Transporter } from "nodemailer";

const mailer: Transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_SECURE,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
  pool: true,
});

export default mailer;
