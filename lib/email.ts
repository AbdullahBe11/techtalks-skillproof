import nodemailer from "nodemailer"

// Email is sent over SMTP (works with a Gmail account + App Password, or any
// SMTP provider). Configure with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// and EMAIL_FROM — see .env.example.
export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  )
}

export async function sendEmail(options: {
  to: string
  subject: string
  text: string
  html: string
}): Promise<void> {
  const port = Number(process.env.SMTP_PORT ?? 465)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  })
}
