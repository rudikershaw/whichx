
# WhichX

## Principles 

Before you contribute, you should know that this project has a few principles we would like to maintain going forward;

* **No dependencies.** The classifier should be fully self contained.
* **Broadest possible support.** The deliverable should work even on 20+ year old technology.
* **Simplicity.** This is not a research project. It is an easy to use tool for anyone with basic understanding of classification.
* **Small.** This library should stay tiny.

## Contributing

To get started making changes to the project you will need to;

1. Install node\* and npm.
2. Run `npm run build` in the root of the project.

As long as any changes you make pass all linting checks and unit tests, feel free to raise a pull request. Please write new tests for any changes you make.

\* If you are having issues running `npm run build`, you can check which version of Node is being used by the Travis CI builds by consulting [.travis.yml](../.travis.yml) configuration file. To ensure build consistency, you should aim to use the same (or similar) version of Node and NPM where possible.
