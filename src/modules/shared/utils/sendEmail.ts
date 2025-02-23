import * as nodemailer from "nodemailer";
import { emailService } from "../../../config";

export default async function sendEmail(to: string, subject: string, text: string) {
  const hostname: string = emailService.hostname
  const username: string = emailService.username
  const password: string = emailService.password
  const from: string = emailService.from

  const transporter = nodemailer.createTransport({
    host: hostname,
    port: 465,
    logger: true,
    secure: true,
    auth: {
      user: username,
      pass: password,
    },
  });

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
  });

  return info
}