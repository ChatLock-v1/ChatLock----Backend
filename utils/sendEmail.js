import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // or use SMTP configuration
    auth: {
      user: process.env.EMAIL_USER,     // Your email
      pass: process.env.EMAIL_PASS,     // Your email password or app password
    },
  });

  const mailOptions = {
    from: `"ChatLock Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
