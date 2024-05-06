#!/usr/bin/env node
import App from './app.js';
import React from 'react';
import meow from 'meow';
import { REGISTERED_COMMANDS } from './command-registry.js';
import { render } from 'ink';

const commandList = Object.entries(REGISTERED_COMMANDS).map(
    ([commandName, command], idx: number) => {
        return `${idx === 0 ? '' : '\t'}[${commandName}] ${
            command.config.description
        }`;
    }
);

const cli = meow(
    `
	Usage
	  $ gumption <COMMAND>

	Commands
	${commandList.join('\n')}

	Help
	  $ gumption help
	  $ gumption help <COMMAND>
`,
    {
        importMeta: import.meta,
    }
);

render(<App cli={cli} />);
