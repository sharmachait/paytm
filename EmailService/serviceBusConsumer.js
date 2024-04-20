const { isServiceBusError, ServiceBusClient } = require('@azure/service-bus');

const sendMail = require('./emailService');

const dotenv = require('dotenv');
dotenv.config();

async function processMessage(message) {
  try {
    console.log({ email: typeof message.body.email });
    console.log({ confirmationToken: message.body.confirmationToken });
    const from = {
      name: 'Paytm',
      address: process.env.senderemail,
    };
    const to = message.body.email;
    const subject = 'Paytm account verfication';
    const token = message.body.confirmationToken;
    const response = await sendMail(from, to, subject, token);
    if (response !== 'Email Sent Successfully')
      throw new Error('email not sent');
  } catch (e) {
    console.log(e);
  }
}

async function processError(args) {
  console.log(`Error from source ${args.errorSource} occurred: `, args.error);
  if (isServiceBusError(args.error)) {
    switch (args.error.code) {
      case 'MessagingEntityDisabled':
      case 'MessagingEntityNotFound':
      case 'UnauthorizedAccess':
        console.log(
          `An unrecoverable error occurred. Stopping processing. ${args.error.code}`,
          args.error
        );
        await subscription.close();
        break;
      case 'MessageLockLost':
        console.log(`Message lock lost for message`, args.error);
        break;
      case 'ServiceBusy':
        await delay(1000);
        break;
    }
  }
}

async function readFromQueue() {
  let messageBusClient = new ServiceBusClient(
    process.env.SERVICEBUSCONNECTIONSTRING
  );
  let receiver = messageBusClient.createReceiver(process.env.QUEUENAME);
  try {
    const subscription = receiver.subscribe({
      processMessage,
      processError,
    });
  } catch (e) {
    console.log(e);
    await messageBusClient.close();
  }
}

readFromQueue().catch((err) => {
  console.log('ReceiveMessagesStreaming - Error occurred: ', err);
  process.exit(1);
});
