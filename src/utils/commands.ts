import { Command, CommandGroup, isCommand, isCommandGroup } from '../types.js';
import { REGISTERED_COMMANDS } from '../command-registry.js';

export const findCommand = ({
    accessor,
    matchAliases = true,
}: {
    accessor: string[];
    matchAliases?: boolean;
}): Command | undefined => {
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
