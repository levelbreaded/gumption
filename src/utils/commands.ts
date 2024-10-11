import { Command, CommandGroup, isCommand, isCommandGroup } from '../types.js';
import {
    REGISTERED_COMMANDS,
    TOP_LEVEL_ALIASES,
    TopLevelAliasKey,
} from '../command-registry.js';
import { Result } from 'meow';

export const findCommand = ({
    accessor: _accessor,
    matchAliases = true,
}: {
    accessor: string[];
    matchAliases?: boolean;
}): Command | undefined => {
    let accessor: string[] = _accessor;

    // top level aliases will always be the first input if included
    if (_accessor.length && _accessor[0] && _accessor[0] in TOP_LEVEL_ALIASES) {
        accessor = TOP_LEVEL_ALIASES[_accessor[0] as TopLevelAliasKey];
    }

    return _findCommandInGroup({
        group: REGISTERED_COMMANDS,
        accessor,
        matchAliases,
    });
};

export const findCommandGroup = ({
    accessor,
    matchAliases = true,
}: {
    accessor: string[];
    matchAliases?: boolean;
}): CommandGroup | undefined => {
    return _findGroup({
        group: REGISTERED_COMMANDS,
        accessor,
        matchAliases,
    });
};

const _findCommandInGroup = ({
    group,
    accessor,
    matchAliases = true,
}: {
    group: CommandGroup;
    accessor: string[];
    matchAliases?: boolean;
}): Command | undefined => {
    const firstAccessor = accessor?.[0];
    if (firstAccessor === undefined || accessor.length === 0) return;

    for (const key in group) {
        const command = group[key];
        if (!command) continue;

        if (isCommand(command)) {
            if (firstAccessor === key) return command;
            if (firstAccessor === command.config.key) return command;
            if (
                matchAliases &&
                command.config.aliases &&
                command.config.aliases.includes(firstAccessor)
            )
                return command;
        }

        if (isCommandGroup(command)) {
            const shouldSearchGroup =
                key === firstAccessor ||
                (matchAliases && command._group?.alias === firstAccessor);

            if (shouldSearchGroup) {
                return _findCommandInGroup({
                    group: command,
                    accessor: accessor.slice(1),
                    matchAliases,
                });
            }
        }
    }

    return;
};

const _findGroup = ({
    group,
    accessor,
    matchAliases = true,
}: {
    group: CommandGroup;
    accessor: string[];
    matchAliases?: boolean;
}): CommandGroup | undefined => {
    const firstAccessor = accessor?.[0];
    if (firstAccessor === undefined || accessor.length === 0) return;

    for (const key in group) {
        const command = group[key];
        if (!command) continue;

        if (isCommand(command)) continue;

        if (isCommandGroup(command)) {
            if (key === firstAccessor && accessor.length === 1) return command;
            if (
                matchAliases &&
                command._group.alias === firstAccessor &&
                accessor.length === 1
            )
                return command;

            const shouldSearchGroup =
                key === firstAccessor ||
                (matchAliases && command._group?.alias === firstAccessor);

            if (shouldSearchGroup) {
                return _findGroup({
                    group: command,
                    accessor: accessor.slice(1),
                    matchAliases,
                });
            }
        }
    }

    return;
};

/**
 * Return an array of the accessor strings to target every command in a group,
 * including every permutation using the aliases of groups and commands
 */
export const getAllAccessors = (
    group: CommandGroup,
    name?: string
): string[] => {
    let accessors: string[] = [];

    Object.entries(group).forEach(([key, command]) => {
        if (isCommand(command)) {
            accessors = [
                ...accessors,
                name ? `${name} ${command.config.key}` : command.config.key,
            ];

            if (command.config.aliases) {
                command.config.aliases.forEach((alias) => {
                    accessors = [
                        ...accessors,
                        ...(name ? [`${name} ${alias}`] : [alias]),
                    ];
                });
            }
        }

        if (isCommandGroup(command)) {
            accessors = [
                ...accessors,
                ...getAllAccessors(command, name ? `${name} ${key}` : key),
                ...(command._group?.alias
                    ? [
                          ...getAllAccessors(
                              command,
                              name
                                  ? `${name} ${command._group.alias}`
                                  : command._group.alias
                          ),
                      ]
                    : []),
            ];
        }
    });
    return accessors;
};

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type GumCliResult = Pick<Result<any>, 'input' | 'flags' | 'unnormalizedFlags'>;
export const getCli = ({
    input: _input,
    ...cli
}: GumCliResult): GumCliResult => {
    let input = _input;

    if (_input.length && _input[0] && _input[0] in TOP_LEVEL_ALIASES) {
        const actualAccessor = TOP_LEVEL_ALIASES[_input[0] as TopLevelAliasKey];
        // sloppy copy of array so .splice doesn't modify the input array
        const _inputCopy = _input.slice();
        _inputCopy.splice(0, 1, ...actualAccessor);
        input = _inputCopy;
    }

    return {
        ...cli,
        input,
    };
};
