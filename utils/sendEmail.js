const nodemailer = require("nodemailer");
const { options } = require("../routes/auth");

const sendEmail = async (options)  => {
  

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.PRT,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  // send mail with defined transport object
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message, 
  }

  const info = await transporter.sendMail(message)
  console.log("Message sent: %s", info.messageId);

}

module.exports = sendEmail