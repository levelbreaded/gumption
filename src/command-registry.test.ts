import { REGISTERED_COMMANDS } from './command-registry.js';
import { describe, expect, it } from 'vitest';

describe('command registry is configured correctly', () => {
    it('has commands where the registered command key is the same as the key property of the command', () => {
        const results = Object.entries(REGISTERED_COMMANDS).map(
            ([key, command]) => key === command.config.key
        );
        expect(results.every((_) => _)).to.equal(true);
    });

    it('has unique command keys and aliases', () => {
        const commandKeys = Object.values(REGISTERED_COMMANDS).map(
            (command) => command.config.key
        );
        const commandAliases = Object.values(REGISTERED_COMMANDS).reduce(
            (acc, curr) => [...acc, ...(curr.config.aliases ?? [])],
            [] as string[]
        );

        const commandKeysAndAliasArray = [...commandKeys, ...commandAliases];

        const commandKeyAndAliasSet = new Set(commandKeysAndAliasArray);
        expect(commandKeyAndAliasSet.size).to.equal(
            commandKeysAndAliasArray.length,
            'Command keys and aliases are not unique.'
        );
    });
});
