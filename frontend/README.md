# Sleep API - Frontend

This is a project in its early days, but it's scheduled to replace the backend-hosted basic website at some point.

The frontend is written in Typescript with [Vue.js][vue.js]. Currently it uses Bulma as its CSS framework, but this will most likely be replaced with [Vuetify][Vuetify] (Material Design 2).

## Running the bot in development mode

Everytime a file in the folder is saved, the frontend will be automatically recompiled and restarted using [Vite][Vite].

### Start the development server

```
npm run dev
```

This script cleans, compiles and starts the development server.

### Run all automated tests locally

```
npm run test
```

Currently the project is in the starting grounds and no tests have been written yet.

### Run the frontend in production mode

```
npm run start
```

This is still run locally (you're safe). This is used by the final Azure deployment to start the service from the compiled javascript /dist folder. This is a good sanity-check before opening a pull request with your suggested changes

For a complete list of available scripts, check the `package.json` file.

[vue.js]: https://vuejs.org/
[Vuetify]: https://vuetifyjs.com/en/
[Vite]: https://vitejs.dev/
