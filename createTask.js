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

// sample-metadata:
//   title: Cloud Tasks Create App Engine Target
//   description: Create Cloud Tasks with a Google App Engine Target
//   usage: node createTask.js <projectId> <queueName> <location> <payload> <delayInSeconds>

/**
 * Create a task for a given queue with an arbitrary payload.
 */
function main(
  project = 'my-project-id', // Your GCP Project id
  queue = 'my-appengine-queue', // Name of your Queue
  location = 'us-central1', // The GCP region of your queue
  payload = 'Hello, World!', // The task HTTP request body
  inSeconds = 0 // Delay in task execution
) {
  // [START cloud_tasks_appengine_create_task]
  // Imports the Google Cloud Tasks library.
  const {CloudTasksClient} = require('@google-cloud/tasks');

  // Instantiates a client.
  const client = new CloudTasksClient();

  async function createTask() {
    // TODO(developer): Uncomment these lines and replace with your values.
    const project = 'kelly-tock-2';
    const queue = 'my-queue';
    const location = 'us-central1';
    const payload = 'Hello, World!';

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

      if (payload) {
        task.appEngineHttpRequest.body = Buffer.from(`${payload} ${stamp}`).toString('base64');
      }

      const seconds = inSeconds + Date.now() / 1000;

      if (inSeconds) {
        console.log('scheduling task to occur in', seconds)
        // The time when the task is scheduled to be attempted.
        task.scheduleTime = {
          seconds,
        };
      }

      console.log('Sending task:');
      console.log(task);
      // Send create task request.
      const request = {parent: parent, task: task};
      const [response] = await client.createTask(request);
      const name = response.name;
      console.log(`Created task ${name}`);
      console.log('\n');
    }
  }
  createTask();
  // [END cloud_tasks_appengine_create_task]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));