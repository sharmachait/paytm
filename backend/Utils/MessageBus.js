const { ServiceBusClient } = require('@azure/service-bus');
const { v4: uuidv4 } = require('uuid');

async function PublishMessage(message) {
  try {
    let messageBusClient = new ServiceBusClient(
      process.env.SERVICEBUSCONNECTIONSTRING
    );
    let sender = messageBusClient.createSender(process.env.QUEUENAME);

    const serviceBusMessage = {
      body: message,
      correlationId: uuidv4(),
    };
    await sender.sendMessages(serviceBusMessage);
    await messageBusClient.close();
  } catch (e) {
    console.log(e);
  }
}

module.exports = PublishMessage;
