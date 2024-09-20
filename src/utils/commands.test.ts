import { REGISTERED_COMMANDS } from '../command-registry.js';
import { describe, expect, it, vi } from 'vitest';
import { findCommand } from './commands.js';

describe('findCommand is working normally', () => {
    vi.mock('../command-registry.js', () => {
        return {
            REGISTERED_COMMANDS: {
                test: {
                    config: {
                        key: 'test',
                        aliases: ['t'],
                    },
                },
            },
        };
    });

    it('it finds commands that exist', () => {
        const definitelyACommandKey =
            Object.values(REGISTERED_COMMANDS)[0]?.config?.key;

        if (!definitelyACommandKey) {
            expect.fail('Oops, not definitely a command key I guess');
            return;
        }

        const result = findCommand({ accessor: definitelyACommandKey });
        expect(result).to.not.equal(undefined);
    });

    it('returns undefined for commands it cannot find', () => {
        const definitelyACommandKey =
            Object.values(REGISTERED_COMMANDS)[0]?.config?.key;

        if (!definitelyACommandKey) {
            expect.fail('Oops, not definitely a command key I guess');
            return;
        }

        const result = findCommand({
            accessor: `${definitelyACommandKey}-wont-match`,
        });
        expect(result).to.equal(undefined);
    });

    it('only matches aliases when specified', () => {
        const definitelyACommandAlias =
            Object.values(REGISTERED_COMMANDS)[0]?.config?.aliases?.[0];

        if (!definitelyACommandAlias) {
            expect.fail('Oops, not definitely a command alias I guess');
            return;
        }

        const result1 = findCommand({
            accessor: definitelyACommandAlias,
        });
        expect(result1).to.not.equal(
            undefined,
            'findCommand should match aliases by default'
        );

        const result2 = findCommand({
            accessor: definitelyACommandAlias,
            matchAliases: true,
        });
        expect(result2).to.not.equal(
            undefined,
            'findCommand should match aliases when specified to'
        );

        const result3 = findCommand({
            accessor: definitelyACommandAlias,
            matchAliases: false,
        });
        expect(result3).to.equal(
            undefined,
            'findCommand should not match aliases when specified not to'
        );
    });
});
