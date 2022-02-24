/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
const topicNameOrId = 'my-topic';


// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');

// Creates a client; cache this for further use
const pubSubClient = new PubSub();

function sleep() {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 500);
  })  
}

async function publishMessage() {

  for (let step = 0; step < 1000; step++) {
    const data = JSON.stringify({ start: new Date().toISOString() });
    const dataBuffer = Buffer.from(data);
  
    try {
      const messageId = await pubSubClient
        .topic(topicNameOrId)
        .publish(dataBuffer);
      console.log(`Message ${messageId} published.`);
    } catch (error) {
      console.error(`Received error while publishing: ${error.message}`);
      process.exitCode = 1;
    }
    // await sleep();
  }
  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  
}

publishMessage();