const express = require('express');
const amqp = require('amqplib');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

app.post('/send-email', async (req, res) => {
  const emailData = req.body;

  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'email_queue';

    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(emailData)), { persistent: true });

    res.status(200).json({ message: 'Email request sent to the queue.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending email request to the queue.' });
  }
});

app.listen(process.env.PORT || '3000', () => {
  console.log(`Server is running on port: ${process.env.PORT || '3000'}`);
});
