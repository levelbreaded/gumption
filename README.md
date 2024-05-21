# gumption

CLI for stacked Git commands

## Development

### First-Time Setup

Before installing packages, make sure to authenticate your local `~/.npmrc` to
Github Packages so it can read Github Packages.

1.  Generate a PAT using this guide:
    [Creating a Personal Access Token (classic)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic)

        1. Make sure the PAT has atleast `read:packages` scope like so:
        	![image showing permissions required for GH PAT](static/images/ghpermissions.png)

2.  Copy the contents `.npmrc.sample` file into a newly created `.npmrc` file in
    the root of this project. Replace `<YOUR_TOKEN_HERE>` with the PAT generated
    above.

    1. Alternative methods and further reading available on GH Docs here:
       [Authenticating to Github Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token).

3.  Run `npm i` to install dependencies as usual.

4. Link the package to your global npm packages:

	```bash
	$ npm link && npm install --global gumption
	```

## Documentation

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
