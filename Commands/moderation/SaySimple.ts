import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { PermissionResolvable } from "discord.js";

export class SaySimpleCommand implements ICommand {
	public readonly name: string = "saysimple";
	public readonly aliases: string[] = [];
	public readonly argumentIsNecessary: boolean = true;
	public readonly description: string = "Envoi un message avec le bot dans le salon utilisé";
	public readonly usage: string = "<text>";
	public readonly guildOnly: boolean = true;
	public readonly cooldown: number = 0;
	public readonly permission: PermissionResolvable = "MANAGE_MESSAGES";

	async run(commandContext: CommandContext): Promise<void> {
		const messageToSend: string = commandContext.args.join(" ");
		await commandContext.message.channel.send(messageToSend);
	}
}