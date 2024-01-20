# Sleep API - Bot

This is a project in its early days. Currently it only exposes a health-check API and responds to a simple ping slash command.

The Discord bot is written in Typescript with [Discord.js][discord.js] so we can keep a unified code standard for Sleep API. This would also allow us to easier share code between deployments if needed.

There is currently no development Discord server setup where you can start a development version of the bot to test. Therefore you're going to need to create an own bot application and enter the secret information in your local environment config.

## Configuration options

As mentioned in the [previous section](#sleep-api---bot) you'll need to create an own bot application for now.

| Environment variable name | Description                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `DISCORD_TOKEN`           | The login token of your bot application.                                                               |
| `DISCORD_CLIENT_ID`       | The client id for your bot application, this is used for example for registering application commands. |

|

## Running the bot in development mode

Everytime a file in the folder is saved, the bot will be automatically recompiled and restarted using [nodemon][nodemon].

### Start the development server

```
npm run dev
```

This script cleans, compiles and starts the development server.

The bot also hosts a public API currently only used for health-checking, but it's available at <http://localhost:3000/docs> if needed.

### Run all automated tests locally

```
npm run test
```

Currently the project is in the starting grounds still and no tests have been written yet.

### Run the bot in production mode

```
npm run start
```

This is still run locally (you're safe). This is used by the final environment deployment to start the service from the compiled javascript /dist folder. This is a good sanity-check before opening a pull request with your suggested changes

For a complete list of available scripts, check the `package.json` file.

[discord.js]: https://discord.js.org/
