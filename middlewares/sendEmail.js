import nodemailer from "nodemailer";

export const sendEmail = async(options)=>{

    var transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "1415567140701e",
          pass: "879187f1d7f118"
        }
      });

    const mailOptions = {
        from : process.env.SMTP_MAIL,
        to : options.email,
        subject : options.subject,
        text : options.message,
    }
    await transporter.sendMail(mailOptions);

}