# Sleep API - Backend

As explained in [Development Setup](../DEVELOPMENT_SETUP.md) you should now have Node installed with NVM and set up your development environment. We'll now talk about getting the backend up and running. Start by installing the required node modules with `npm install` inside the backend folder.

The backend also currently hosts the website you see on [Sleep API][sleepapi]

## Configuration options

The following configuration options are available in the backend. All environment variables are optional for basic local development, but if you want to do certain things like use the database features you will need some of them.
We'll also explain how to set up your local database in the [Database section](#database).

| Environment variable name                  | Description                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS` | These are needed to access the database.                                                                                                                                                                                                                                                                                     |
| `DATABASE_MIGRATION`                       | Accepted values are UP and DOWN. This is used to create the database schema as well as seed the initial data used for focused/flexible/buddy rankings. The schema will remember if you have migrated/seeded and will skip migration the next time. If you want to test the migration/seeding you'll have to DOWN in between. |
| `SECRET`                                   | This is used to authorize tier list creation. The creation of a tier list triggers a simulation which is quite performance intense, therefore it's not available in the public API. You can trigger creations locally by including a "secret" header matching this environment variable with your POST request.              |

|

You can create a .env file in the `backend` folder and add the needed configuration options, for example:

```
# database
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASS="admin"
DATABASE_MIGRATION="UP"

# tier list creation
SECRET = <any secret>
```

## Running backend in development mode

Everytime a file in the folder is saved, the backend will be automatically recompiled and restarted using [nodemon][nodemon].

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

## Database

Sleep API uses MySQL as the database. We provide you with a Docker compose file to setup the necessary container and initial schema. If you want to change any Docker settings, you need to modify the `compose.yml` file - they are not picked up from the `.env` file described above.

Note: If `docker compose` does not work on your system follow instructions [here](https://docs.docker.com/compose/install/). If you're developing on Windows with WSL, you may need [these instructions](https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-containers) as well.

Starting the container

```
docker compose up -d
```

If you need to wipe your database to start over

```
docker compose down
```

Accessing the database shell directly

```
docker exec -it backend-db-1 mysql -padmin
```

[sleepapi]: https://sleepapi.net/
[nodemon]: https://nodemon.io/
