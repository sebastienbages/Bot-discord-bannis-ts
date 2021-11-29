import { CommandInteraction, PermissionResolvable } from "discord.js";
import { ApplicationCommandOptionType } from "discord-api-types/v9";

export interface ISlashCommand {
	readonly name: string;
	readonly description: string;
	readonly permission: PermissionResolvable;
	readonly commandOptions: CommandOptions[];
	readonly subCommandsOptions: SubCommandOptions[];
	executeInteraction(commandInteraction: CommandInteraction): Promise<void>;
}

export declare type SubCommandOptions = {
	name: string,
	description: string,
	option?: CommandOptions,
}

export declare type CommandOptions = {
	type: ApplicationCommandOptionType,
	name: string,
	description: string,
	isRequired: boolean,
	choices?: ChoiceOption[],
}

export declare type ChoiceOption = [
	name: string,
	value: string,
]
