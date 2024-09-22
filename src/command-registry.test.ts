import {
    Command,
    CommandGroup,
    CommandGroupConfig,
    isCommand,
    isCommandGroupConfig,
} from './types.js';
import { REGISTERED_COMMANDS } from './command-registry.js';
import { describe, expect, it } from 'vitest';
import { getAllAccessors } from './utils/commands.js';

describe('command registry is configured correctly', () => {
    it('yada', () => {
        // check();
    });

    it('has commands where the registered command key is the same as the key property of the command', () => {
        function allCommandsValid(
            key: string,
            command: Command | CommandGroup | CommandGroupConfig
        ): boolean {
            if (isCommand(command)) {
                return key === command.config.key;
            }

            if (isCommandGroupConfig(command)) {
                return true;
            }

            if (typeof command !== 'object') {
                return true;
            }
            return Object.entries(command).every(([_key, _command]) => {
                return allCommandsValid(_key, _command);
            });
        }

        const properlyConfigured = Object.entries(REGISTERED_COMMANDS).reduce(
            (acc, [key, command]) => {
                return acc && allCommandsValid(key, command);
            },
            true
        );
        expect(properlyConfigured).to.equal(true);
    });

    it('has unique command keys and aliases', () => {
        const allAccessors = getAllAccessors(REGISTERED_COMMANDS);
        const allAccessorsSet = new Set(allAccessors);

        expect(allAccessors.length).to.equal(allAccessorsSet.size);
    });
});
