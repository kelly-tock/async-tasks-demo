/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
const subscriptionNameOrId = 'my-pull-sub';
const timeout = 60;

// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');

// Creates a client; cache this for further use
const pubSubClient = new PubSub();

function sleep() {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 500);
  })  
}

function listenForMessages() {
  // References an existing subscription
  const subscription = pubSubClient.subscription(subscriptionNameOrId);

  // Create an event handler to handle messages
  let messageCount = 0;
  const messageHandler = async (message) => {
    // console.log(`Received message ${message.id}:`);
    // console.log(`\tData: ${message.data.start}`);
    // console.log(`\tAttributes: ${message.attributes}`);
    const parsedBody = JSON.parse(Buffer.from(message.data, 'base64').toString('utf-8'));
    // console.log(parsedBody);
    messageCount += 1;

    const end = new Date().getTime();
    const start = new Date(parsedBody.start).getTime();
    console.log('Latency(task created to task received)', (end - start)/1000);

    message.ack();

  };

  // Listen for new messages until timeout is hit
  subscription.on('message', messageHandler);

  process.on('beforeExit', () => {
    subscription.removeListener('message', messageHandler);
    console.log(`${messageCount} message(s) received.`);
  })

}

listenForMessages();