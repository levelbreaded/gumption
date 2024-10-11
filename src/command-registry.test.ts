import {
    Command,
    CommandGroup,
    CommandGroupConfig,
    isCommand,
    isCommandGroup,
    isCommandGroupConfig,
} from './types.js';
import { REGISTERED_COMMANDS, TOP_LEVEL_ALIASES } from './command-registry.js';
import { describe, expect, it } from 'vitest';
import { findCommand, getAllAccessors } from './utils/commands.js';

describe('command registry is configured correctly', () => {
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

            if (isCommandGroup(command)) {
                return Object.entries(command).every(([_key, _command]) => {
                    return allCommandsValid(_key, _command);
                });
            }

            return true;
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

describe('top level aliases are configured correctly', () => {
    it('top level aliases do not clash with top level commands or groups', () => {
        const allTopLevelAliases = Object.keys(TOP_LEVEL_ALIASES);
        const topLevelCommandAccessors: string[] = [];
        Object.entries(REGISTERED_COMMANDS).forEach(([key, value]) => {
            if (isCommand(value)) {
                topLevelCommandAccessors.push(key);
                if (value.config.aliases) {
                    topLevelCommandAccessors.push(...value.config.aliases);
                }
            }
            if (isCommandGroup(value)) {
                topLevelCommandAccessors.push(key);
                if (value._group.alias) {
                    topLevelCommandAccessors.push(value._group.alias);
                }
            }
        });

        const topLevelAccessors = [
            ...topLevelCommandAccessors,
            ...allTopLevelAliases,
        ];
        const topLevelAccessorsSet = new Set(topLevelAccessors);
        expect(topLevelAccessors.length).to.equal(topLevelAccessorsSet.size);
    });

    it('has aliases that are valid accessors to other commands', () => {
        Object.entries(TOP_LEVEL_ALIASES).forEach(([, accessor]) => {
            const command = findCommand({ accessor });
            expect(command && isCommand(command)).to.equal(true);
        });
    });
});
