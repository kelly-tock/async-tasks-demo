// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START cloud_tasks_appengine_quickstart]
const bodyParser = require('body-parser');
const express = require('express');
const {CloudTasksClient} = require('@google-cloud/tasks');
const {PubSub} = require('@google-cloud/pubsub');

console.log('hahhahahha');

const topicNameOrId = 'my-topic';


// Imports the Google Cloud client library

// Creates a client; cache this for further use
const pubSubClient = new PubSub();

const jsonBodyParser = express.json();
// Instantiates a client.
const client = new CloudTasksClient();

const app = express();
app.enable('trust proxy');

// By default, the Content-Type header of the Task request is set to "application/octet-stream"
// see https://cloud.google.com/tasks/docs/reference/rest/v2beta3/projects.locations.queues.tasks#AppEngineHttpRequest

app.get('/', (req, res) => {
  // Basic index to verify app is serving
  res.send('Hello, World!').end();
});

function fakeApi() {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 1000 * 30);
  })  
}

function sleep() {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 500);
  })  
}

app.get('/create-tasks', async (req, res) => {

  const project = 'kelly-tock-2';
  const queue = 'my-queue';
  const location = 'us-central1';

  // Construct the fully qualified queue name.
  const parent = client.queuePath(project, location, queue);

  for (let step = 0; step < 1000; step++) {
    const task = {
      appEngineHttpRequest: {
        httpMethod: 'POST',
        relativeUri: '/log_payload',
      },
    };

    const stamp = new Date().toISOString();

    task.appEngineHttpRequest.body = Buffer.from(`${stamp}`).toString('base64');

    // console.log('Sending task:');
    // console.log(task);
    // Send create task request.
    const request = {parent: parent, task: task};
    const [response] = await client.createTask(request);
    const name = response.name;
    // console.log(`Created task ${name}`);
    // console.log('\n');

    await sleep();

  }
  res.send('finished creating tasks').end();
});

app.post('/pubsub/push', jsonBodyParser, (req, res) => {
  // if (req.query.token !== PUBSUB_VERIFICATION_TOKEN) {
  //   res.status(400).send();
  //   return;
  // }
  const message = JSON.parse(Buffer.from(req.body.message.data, 'base64').toString('utf-8'));

  const end = new Date().getTime();
  const start = new Date(message.start).getTime();
  console.log('Pubsub Latency(task created to task received)', (end - start)/1000);
  await fakeApi();
  res.status(200).send();
});

app.get('/pubsub/create', async (req, res) => {
  for (let step = 0; step < 1000; step++) {
    const data = JSON.stringify({ start: new Date().toISOString() });
    const dataBuffer = Buffer.from(data);
  
    try {
      const messageId = await pubSubClient
        .topic(topicNameOrId)
        .publish(dataBuffer);
      // console.log(`Message ${messageId} published.`);
    } catch (error) {
      console.error(`Received error while publishing: ${error.message}`);
      process.exitCode = 1;
    }
    // await sleep();
  }

});

app.post('/log_payload', bodyParser.raw({type: 'application/octet-stream'}), async (req, res) => {
  // Log the request payload
  const end = new Date().getTime();
  const parsedBody = Buffer.from(req.body, 'base64').toString('utf-8');
  const start = new Date(parsedBody).getTime();
  // console.log('Received task with payload: %s', req.body);
  console.log('Tasks Latency(task created to task received)', (end - start)/1000);
  await fakeApi();
  res.send(`Printed task payload: ${req.body}`).end();
});

app.get('*', (req, res) => {
  res.send('OK').end();
});

const PORT = process.env.PORT || 8080;
app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END cloud_tasks_appengine_quickstart]
