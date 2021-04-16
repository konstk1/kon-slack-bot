require('dotenv').config();
const { WebClient, LogLevel } = require("@slack/web-api");

const client = new WebClient(process.env.SLACK_TOKEN, {
  logLevel: LogLevel.INFO,
});

async function findDeleted(userList, sinceDaysAgo = 1) {
  const updatedCutoff = (Date.now() / 1000 ) - sinceDaysAgo * 24 * 3600 - 3600; // timestamp in seconds (subtract an hour to overlap)

  deletedUsers = userList.filter(u => u.deleted && u.updated > updatedCutoff);
  deletedUsers.sort((a, b) => b.updated - a.updated); // sort in reverse chron order by updated time

  deletedUsers = deletedUsers.map(u => {
    return {
      name: u.name,
      realName: u.profile.real_name,
      updated: new Date(u.updated * 1000).toLocaleString(),
    };
  });

  // console.log('deleted :>> ', deletedUsers.slice(0, 5));

  let message = 'No one deactivated in last 24 hours';
  if (deletedUsers.length > 0) {
    message = deletedUsers.map(u => `${u.realName} (${u.name}) deactivated on ${u.updated}`).join('\n')
  }

  const result = await client.chat.postMessage({
    channel: process.env.SLACK_USER_ID,
    text: `\`\`\`${message}\`\`\``,
  });

  // console.log(result);

  return deletedUsers;
}

async function run() {
  console.log("Kon slack bot");

  try {
    // Call the users.list method using the WebClient
    const result = await client.users.list();
    // console.log('result :>> ', result.members.filter(m => m.profile.real_name.includes('Konstantin')));
    
    findDeleted(result.members, 1);

  }
  catch (error) {
    console.error(error);
  }
}

run();