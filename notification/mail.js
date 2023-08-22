const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});
transporter.verify().then(console.log).catch(console.error);




function sendNotification(email, message) {
    const htmlContent = `
  <html>
    <head>
      <style>
        /* Add your CSS styles here */
        body {
          font-family: Arial, sans-serif;
        }
        .container {
          padding: 20px;
          background-color: #f0f0f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Update Request Status</h1>
        <p>${message}</p>
      </div>
    </body>
  </html>
`;
    transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Update Request Status",
        text: message,
        html: htmlContent, // Specify your HTML content here
    }).then(info => {
        console.log({ info });
    }).catch(console.error);
}

module.exports = sendNotification; 