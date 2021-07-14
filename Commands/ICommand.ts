import { PermissionResolvable } from "discord.js";
import { CommandContext } from "./CommandContext";

export interface ICommand {
	readonly name: string;
	readonly aliases: string[];
	readonly description: string;
	readonly argumentIsNecessary: boolean;
	readonly guildOnly: boolean;
	readonly cooldown: number;
	readonly permission: PermissionResolvable;
	readonly usage: string;
	run(parsedUserCommand: CommandContext): Promise<void>;
}