const amqp = require('amqplib');
const nodemailer = require('nodemailer');

const QUEUE = 'email_queue';

(async function () {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE, { durable: true });
    channel.prefetch(1);

    console.log('Waiting for messages in the queue...');

    channel.consume(QUEUE, async (msg) => {
      if (msg !== null) {
        const emailData = JSON.parse(msg.content.toString());

        // Send email using nodemailer
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: '465',
          auth: {
            user: '3nccrvs.psa@gmail.com',
            pass: 'bbfjplplayqemiyk',
          },
        });

        console.log('Received email data:', emailData);

        const mailOptions = {
          from: 'mccabullos@gmail.com',
          to: emailData.to,
          subject: emailData.subject,
          text: emailData.body,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log('Email sent:', emailData);
          channel.ack(msg);
        } catch (error) {
          console.error('Error sending email:', error);
          channel.nack(msg);
        }
      }
    });
  } catch (error) {
    console.error('Consumer error:', error);
  }
})();
