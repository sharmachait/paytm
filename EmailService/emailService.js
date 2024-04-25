const nodemailer = require('Nodemailer');
function createOptions(from, to, subject, token) {
  return {
    from: from,
    to: to,
    subject: subject,
    text: `Please clink on the link below to verify your email id. \n http://localhost:5173/verify \n your authentication token is ${token}`,
  };
}
const sendMail = async (
  from,
  to,
  subject = 'Paytm account verfication',
  token = null
) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.senderemail,
        pass: process.env.POEMAILPASSWORD,
      },
    });
    const mailOptions = createOptions(from, to, subject, token);
    await transporter.sendMail(mailOptions);
    return 'Email Sent Successfully';
  } catch (e) {
    return e;
  }
};

module.exports = sendMail;
