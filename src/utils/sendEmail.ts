import nodemailer from 'nodemailer';

export const sendEmail = async (verifyUrl: string, email: string) => {
    try {

        const transport = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            }
        });

        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: email,
            subject: 'Mail from Karwaan',
            html: `<!DOCTYPE html>
            <html lang="en">
            
            <head>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://kit.fontawesome.com/a768343406.js" crossorigin="anonymous"></script>
              <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
              <style>
                body{
              width: 100%;
              text-align: center;
              padding: auto;
              font-family: 'Poppins', sans-serif;
            }
            
            h1{
              font-size: 2.5rem;
            }
            
            p{
              width: 40%;
              position: relative;
              margin: 10px auto;
              font-size: 1.5rem;
            }
            
            a{
              font-size: 2rem;
              text-decoration: none;
              margin: 10px;
            }
              </style>
              <title>Mail from Kunal!</title>
            </head>
            
            <body>
              <div id="container">
                <h1>A message from Karwaan films</h1>
                <p>You recieved this email becasue of a request you make on the karwaan web app, please click on the button given below to continue with your request process.</p>
                <a href="${verifyUrl}">Continue on the link.</a>
              </div>
            </body>
            
            </html>`
        };

        await transport.sendMail(mailOptions).catch((error) => console.log(error));
    } catch (error) {
        throw error;
    }
};
