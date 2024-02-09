# Sleep API - Backend

As explained in [Development Setup](../DEVELOPMENT_SETUP.md) you should now have Node installed with NVM, set up your development environment and built the common module. We'll now talk about getting the backend up and running.

Start by installing the required node modules with `npm install` inside the backend folder.

The backend also currently hosts the website you see on [Sleep API][sleepapi].

## Running backend in development mode

Everytime a .ts file in the folder is saved, the backend will be automatically recompiled and restarted using [nodemon][nodemon].

_Note: Nodemon currently doesn't detect changes to .html files so if you're working on the frontend you may want to use `npm run frontend` instead. This won't re-build the backend and won't detect changes in .html files either, but it'll start super fast. So just re-run the script if you made changes in the .html files or run `npm run build` if you made changes in the backend._

### Start the development server

```
npm run dev
```

This script cleans, compiles and starts the development server.

The backend will listen to port 3000. The API is reachable using <http://localhost:3000/docs>

### Run all automated tests locally

```
npm run test
```

### Run the backend in production mode

```
npm run start
```

This is still run locally (you're safe). This is used by the final environment deployment to start the service from the compiled javascript /dist folder. This is a good sanity-check before opening a pull request with your suggested changes

For a complete list of available scripts, check the `package.json` file.

[sleepapi]: https://sleepapi.net/
[nodemon]: https://nodemon.io/
