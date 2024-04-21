#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';
import {type Command, REGISTERED_COMMANDS} from './command-registry.js';

const commandList = Object.values(REGISTERED_COMMANDS).map(
	(command: Command, idx: number) => {
		return `${idx === 0 ? '' : '\t'}[${command.name}] ${command.description}`;
	},
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
	},
);

render(<App cli={cli} />);
