import { Command, CommandGroup, isCommand, isCommandGroup } from '../types.js';
import { REGISTERED_COMMANDS } from '../command-registry.js';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { findCommand, findCommandGroup, getAllAccessors } from './commands.js';

describe('findCommand is working normally', () => {
    beforeAll(() => {
        vi.clearAllMocks();
        vi.resetAllMocks();
    });

    vi.mock('../command-registry.js', () => {
        return {
            REGISTERED_COMMANDS: {
                test: {
                    component: null,
                    config: {
                        key: 'test',
                        aliases: ['t'],
                    },
                },
                emptyGroup1: {
                    _group: {
                        alias: 'eg1',
                    },
                },
                emptyGroup2: {
                    _group: {},
                },
                group: {
                    _group: {
                        alias: 'g',
                    },
                    test2: {
                        component: null,
                        config: {
                            key: 'test2',
                            aliases: ['t2'],
                        },
                    },
                    innerGroup: {
                        _group: {
                            alias: 'ig',
                        },
                        test3: {
                            component: null,
                            config: {
                                key: 'test3',
                                aliases: ['t3'],
                            },
                        },
                    },
                },
            },
        };
    });

    it('it works normally with empty groups', () => {
        expect(findCommand({ accessor: ['emptyGroup1'] })).to.equal(undefined);

        expect(
            findCommand({
                accessor: ['emptyGroup2'],
            })
        ).to.equal(undefined);

        expect(
            findCommand({
                accessor: ['eg2'],
            })
        ).to.equal(undefined);
    });

    it('it finds nested commands that exist, even when given extra properties', () => {
        expect(
            returnsCommand(
                findCommand({ accessor: ['test', 'extra1', 'extra2'] })
            )
        ).to.equal(true);

        expect(
            returnsCommand(
                findCommand({
                    accessor: [
                        'group',
                        'innerGroup',
                        'test3',
                        'extra1',
                        'extra2',
                    ],
                })
            )
        ).to.equal(true);
    });

    it('it finds nested commands that exist', () => {
        const result1 = findCommand({ accessor: ['group', 'test2'] });
        expect(returnsCommand(result1)).to.equal(true);

        const result2 = findCommand({
            accessor: ['group', 'innerGroup', 'test3'],
        });
        expect(returnsCommand(result2)).to.equal(true);
    });

    it('it finds nested commands that exist by alias', () => {
        expect(
            returnsCommand(findCommand({ accessor: ['group', 't2'] }))
        ).to.equal(true);

        expect(
            returnsCommand(
                findCommand({
                    accessor: ['group', 'innerGroup', 't3'],
                })
            )
        ).to.equal(true);

        expect(
            returnsCommand(
                findCommand({
                    accessor: ['g', 'innerGroup', 't3'],
                })
            )
        ).to.equal(true);

        expect(
            returnsCommand(
                findCommand({
                    accessor: ['g', 'ig', 't3'],
                })
            )
        ).to.equal(true);

        expect(
            returnsCommand(
                findCommand({
                    accessor: ['group', 'ig', 't3'],
                })
            )
        ).to.equal(true);
    });

    it('it only finds nested commands by alias when specified to', () => {
        expect(
            findCommand({ accessor: ['group', 't2'], matchAliases: false })
        ).to.equal(undefined);

        expect(
            findCommand({
                accessor: ['group', 'innerGroup', 't3'],
                matchAliases: false,
            })
        ).to.equal(undefined);

        expect(
            findCommand({
                accessor: ['g', 'innerGroup', 't3'],
                matchAliases: false,
            })
        ).to.equal(undefined);

        expect(
            findCommand({
                accessor: ['g', 'ig', 't3'],
                matchAliases: false,
            })
        ).to.equal(undefined);

        expect(
            findCommand({
                accessor: ['group', 'ig', 't3'],
                matchAliases: false,
            })
        ).to.equal(undefined);
    });

    it('it finds nothing with an empty accessor array', () => {
        const result = findCommand({ accessor: [] });
        expect(result).to.equal(undefined);
    });

    it('it finds commands that exist', () => {
        const definitelyACommandKey = (
            Object.values(REGISTERED_COMMANDS)[0] as Command
        )?.config?.key;

        if (!definitelyACommandKey) {
            expect.fail('Oops, not definitely a command key I guess');
            return;
        }

        const result = findCommand({ accessor: [definitelyACommandKey] });
        expect(returnsCommand(result)).to.equal(true);
    });

    it('returns undefined for commands it cannot find', () => {
        const definitelyACommandKey = (
            Object.values(REGISTERED_COMMANDS)[0] as Command
        )?.config?.key;

        if (!definitelyACommandKey) {
            expect.fail('Oops, not definitely a command key I guess');
            return;
        }

        const result = findCommand({
            accessor: [`${definitelyACommandKey}-wont-match`],
        });
        expect(result).to.equal(undefined);
    });

    it('only matches aliases when specified', () => {
        const definitelyACommandAlias = (
            Object.values(REGISTERED_COMMANDS)[0] as Command
        )?.config?.aliases?.[0];

        if (!definitelyACommandAlias) {
            expect.fail('Oops, not definitely a command alias I guess');
            return;
        }

        const result1 = findCommand({
            accessor: [definitelyACommandAlias],
        });
        expect(returnsCommand(result1)).to.equal(
            true,
            'findCommand should match aliases by default'
        );

        const result2 = findCommand({
            accessor: [definitelyACommandAlias],
            matchAliases: true,
        });
        expect(returnsCommand(result2)).to.equal(
            true,
            'findCommand should match aliases when specified to'
        );

        const result3 = findCommand({
            accessor: [definitelyACommandAlias],
            matchAliases: false,
        });
        expect(result3).to.equal(
            undefined,
            'findCommand should not match aliases when specified not to'
        );
    });
});

describe('findCommandGroup is working normally', () => {
    beforeAll(() => {
        vi.clearAllMocks();
        vi.resetAllMocks();
    });

    vi.mock('../command-registry.js', () => {
        return {
            REGISTERED_COMMANDS: {
                test: {
                    component: null,
                    config: {
                        key: 'test',
                    },
                },
                emptyGroup1: {
                    _group: {
                        alias: 'eg1',
                    },
                },
                emptyGroup2: {
                    _group: {},
                },
                group: {
                    _group: {
                        alias: 'g',
                    },
                    innerGroup: {
                        _group: {
                            alias: 'ig',
                        },
                        test3: {
                            component: null,
                            config: {
                                key: 'test3',
                                aliases: ['t3'],
                            },
                        },
                    },
                },
            },
        };
    });

    it('finds command groups that exist', () => {
        expect(
            returnsCommandGroup(
                findCommandGroup({
                    accessor: ['emptyGroup1'],
                })
            )
        ).to.equal(true);

        expect(
            returnsCommandGroup(
                findCommandGroup({
                    accessor: ['emptyGroup2'],
                })
            )
        ).to.equal(true);

        expect(
            returnsCommandGroup(
                findCommandGroup({
                    accessor: ['group'],
                })
            )
        ).to.equal(true);

        expect(
            returnsCommandGroup(
                findCommandGroup({
                    accessor: ['group', 'innerGroup'],
                })
            )
        ).to.equal(true);
    });

    it('finds command groups that by alias when specified', () => {
        expect(
            returnsCommandGroup(
                findCommandGroup({
                    accessor: ['eg1'],
                    matchAliases: true,
                })
            )
        ).to.equal(true);

        expect(
            findCommandGroup({
                accessor: ['eg1'],
                matchAliases: false,
            })
        ).to.equal(undefined);

        expect(
            returnsCommandGroup(
                findCommandGroup({
                    accessor: ['g', 'ig'],
                    matchAliases: true,
                })
            )
        ).to.equal(true);

        expect(
            findCommandGroup({
                accessor: ['g', 'ig'],
                matchAliases: false,
            })
        ).to.equal(undefined);
    });

    it('returns nothing with an empty accessor array', () => {
        expect(
            findCommandGroup({
                accessor: [],
            })
        ).to.equal(undefined);
    });

    it('does not match commands', () => {
        expect(
            findCommandGroup({
                accessor: ['test'],
            })
        ).to.equal(undefined);

        expect(
            findCommandGroup({
                accessor: ['group', 'innerGroup', 'test3'],
            })
        ).to.equal(undefined);
    });
});

describe('getAllAccessors is working normally', () => {
    beforeAll(() => {
        vi.clearAllMocks();
        vi.resetAllMocks();
    });

    vi.mock('../command-registry.js', () => {
        return {
            REGISTERED_COMMANDS: {
                test: {
                    component: null,
                    config: {
                        key: 'test',
                        aliases: ['t'],
                    },
                },
                group: {
                    _group: {
                        alias: 'g',
                    },
                    test2: {
                        component: null,
                        config: {
                            key: 'test2',
                            aliases: ['t2'],
                        },
                    },
                    innerGroup: {
                        _group: {
                            alias: 'ig',
                        },
                        test3: {
                            component: null,
                            config: {
                                key: 'test3',
                                aliases: ['t3'],
                            },
                        },
                    },
                },
            },
        };
    });

    it('gets all command accessors correctly', () => {
        const result = getAllAccessors(REGISTERED_COMMANDS);
        const expected = [
            'test',
            't',
            'group test2',
            'group t2',
            'g test2',
            'g t2',
            'group innerGroup test3',
            'group innerGroup t3',
            'group ig test3',
            'group ig t3',
            'g innerGroup test3',
            'g innerGroup t3',
            'g ig test3',
            'g ig t3',
        ];

        expect(result.length).to.equal(expected.length);
        expect(
            expected.filter((a) => !result.find((_) => _ === a)).length
        ).to.equal(0);
    });
});

const returnsCommand = (result?: unknown): boolean => {
    return Boolean(result && isCommand(result as Command | CommandGroup));
};

const returnsCommandGroup = (result?: unknown): boolean => {
    return Boolean(result && isCommandGroup(result as Command | CommandGroup));
};
