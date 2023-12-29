# Contributing

You can find beginner-friendly issues [here][good first issues]. You might need to request contributor access to start, please ping the code owner (@peppermons) directly on Discord.

## Development Setup
The first step to contributing is getting the development environment up and running. Check out [Development Setup](DEVELOPMENT_SETUP.md) to get started.

## Respect the code standard
We're always open to suggestions regarding improvements to the code standard or code structure in place, but until any code standard changes have been enforced; please adhere to the current code structure. 

It's better to have a sub-optimal code standard in place, but have all of the code follow this code standard than have more optimal code standard in some places and different code standard in others. 

The goal is for everyone to get familiar with the code standard and recognize patterns regardless of which part of Sleep API you're working on.

## Quality Assurance
Please write automated tests for any new functionality added. There are plenty of examples in the code, they are written using [Jest][jest].

## Commit standard
We use the well-known [conventional commits][conventional] as commit standard. This is also enforced in our pipeline, so any commits that don't follow this standard won't be allowed to merge.

If you're uncertain about how to write more detailed commits following this format you can always fallback to this shorthand:
```
git commit -m "feat: short description of your task"
```

## Linear history
Please squash and merge your commits to the main branch. The main branch requires linear history (no merge commits). You can do this directly from your PR on Github.

## Contributing outside code
Finally, you are always welcome to contribute to the Sleep API community directly on [Discord][Discord]. Whether its feature requests, UI suggestions, bug reports or just interacting with us socially.

Thank you!

[jest]: https://jestjs.io/
[conventional]: https://www.conventionalcommits.org/
[good first issues]: https://github.com/SleepAPI/SleepAPI/contribute
[Discord]: https://discord.gg/w97qFff8n4