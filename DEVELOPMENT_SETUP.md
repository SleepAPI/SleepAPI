# Development setup

The project acts as a monorepo where each module is individually deployed. It's written in Node.js with Typescript.

| Application | Description                                                                                                                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| backend     | This deployment exposes the public API: [Sleep API][sleepapi]. This is where the simulations, number-crunching and rankings happen. Currently this also exposes a basic html/js/css website, but this is due for replacement. |
| frontend    | A work-in-progress website. The idea is to deploy a full-fledged proper website as a static web app.                                                                                                                          |
| bot         | A work-in-progress Discord bot. Currently this just sets up a basic ping command, but it is deployed and hosted 24/7. There are plans to expand this with functionality from Sleep API.                                       |

|

## Getting started

| Tool   | URL                              |
| ------ | -------------------------------- |
| VSCode | <https://code.visualstudio.com/> |
| NVM    | <https://github.com/nvm-sh/nvm>  |

On Windows it is recommended to use nvm inside WSL (Windows Subsystem for Linux), but other alternatives like nvm-windows exist.

| Tool | URL                                                     |
| ---- | ------------------------------------------------------- |
| WSL  | <https://learn.microsoft.com/en-us/windows/wsl/install> |

The repository includes `sleepapi.code-workspace`, which can be opened with Visual Studio Code's "Open Workspace From File" to automatically download recommended plugins and linters. Code edited without this workspace should be run through [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/).

### 1. Setup correct version of node

Download the configured version of node. This version is specified in .nvmrc in the root of the repository.

```
nvm install
nvm use
```

### 2. Open workspace in VSCode

The workspace is defined in the file `sleepapi.code-workspace`. Install the recommended extensions when prompted.

### 3. See other READMEs for instructions for that package

- [backend](./backend/README.md)
- [frontend](./frontend/README.md)
- [bot](./my-gaim/README.md)

[sleepapi]: https://sleepapi.net/
