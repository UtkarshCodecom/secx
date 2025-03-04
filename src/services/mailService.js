import nodemailer from 'nodemailer';
import config from '../config/config.js';

const { user, password } = config.emailConfig;

const transporter = nodemailer.createTransport({
  service: 'Gmail', // Or any email service like SMTP, Outlook, etc.
  host: 'smtp.gmail.com',
  port: 465,
  secure: false,
  auth: {
    user: user, // Your email address
    pass: password, // Your email password or app-specific password
  },
});

export const sendMail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: user, // Sender address
    to, // Receiver address
    subject, // Email subject
    text, // Plain text body
    html, // HTML body
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email: ', error);
    } else {
      console.log('Email sent: ', info.response);
    }
  });
};
