#!/usr/bin/env node
import App from './app.js';
import React from 'react';
import meow from 'meow';
import { render } from 'ink';

const cli = meow(
    `
	Usage
	  $ gumption <COMMAND>

	Help
	  $ gumption help
	  $ gumption help <COMMAND>
`,
    {
        importMeta: import.meta,
    }
);

render(<App cli={cli} />);
