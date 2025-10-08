import nodemailer, { type Transporter } from "nodemailer";
import config from "~/config.js";

const mailer: Transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: config.MAIL_PORT,
  secure: false,
  auth: {
    user: config.MAIL_USER,
    pass: config.MAIL_PASS,
  },
  pool: true,
});

export default mailer;
