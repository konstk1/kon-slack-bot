require('dotenv').config();
const { WebClient, LogLevel } = require("@slack/web-api");

function findDeleted(userList, sinceDaysAgo) {
  deletedUsers = userList.filter(u => u.deleted);
  deletedUsers.sort((a, b) => b.updated - a.updated); // sort in reverse chron order by updated time

  deletedUsers = deletedUsers.map(u => {
    return {
      name: u.name,
      realName: u.profile.real_name,
      updated: new Date(u.updated * 1000).toLocaleString(),
    };
  });

  console.log('deleted :>> ', deletedUsers.slice(0, 10));
}

async function run() {
  console.log("Kon slack bot");

  const client = new WebClient(process.env.SLACK_TOKEN, {
    logLevel: LogLevel.DEBUG
  });

  try {
    // Call the users.list method using the WebClient
    const result = await client.users.list();
    // console.log('result :>> ', result);
    findDeleted(result.members, 1);

  }
  catch (error) {
    console.error(error);
  }
}

run();