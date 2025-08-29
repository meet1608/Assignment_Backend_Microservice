const path = require('path');
const ejs = require('ejs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false },
});

const sendAddPasswordEmail = async (toEmail, token) => {
  const templatePath = path.join(__dirname, '../templates/email/addPasswordEmail.ejs');
  
  const html = await ejs.renderFile(templatePath, { token });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Set Your Password and verify your email address',
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendAddPasswordEmail;
