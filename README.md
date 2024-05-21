# gumption

CLI for stacked Git commands


## Development

### First-Time Setup
Before installing packages, make sure to authenticate your local `~/.npmrc` to Github Packages so it can read Github Packages.
To do so, generate a PAT using this guide: [Creating a Personal Access Token (classic)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic)
Make sure the PAT has atleast `read:packages` scope like so:

![image showing permissions required for GH PAT](static/images/ghpermissions.png)

Then save the generated token to your local npmrc file located in `~/.npmrc` (create it if needed) by copying the following line:
``` ~/.npmrc
//npm.pkg.github.com/:_authToken=TOKEN
```
Replacing `TOKEN` with the PAT generated above.

Alternative methods and further reading available on GH Docs here: [Authenticating to Github Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token).

Run `npm i` to install dependencies as usual.

## Install

```bash
$ npm link && npm install --global gumption
```

## CLI

```
$ gumption --help

  Usage
    $ gumption

  Options
    --name  Your name

  Examples
    $ gumption --name=Jane
    Hello, Jane
```
