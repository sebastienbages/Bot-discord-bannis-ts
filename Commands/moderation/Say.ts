import { MessageEmbed, PermissionResolvable } from "discord.js";
import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { Config } from "../../Config/Config";

export class SayCommand implements ICommand {
	public readonly name: string = "say";
	public readonly aliases: string[] = [ "dire", "embed" ];
	public readonly argumentIsNecessary: boolean = true;
	public readonly description: string = "Envoi un message enrichi avec le bot dans le salon utilisé";
	public readonly usage: string = "<text>";
	public readonly guildOnly: boolean = true;
	public readonly cooldown: number = 0;
	public readonly permission: PermissionResolvable = "MANAGE_MESSAGES";

	async run(commandContext: CommandContext): Promise<void> {
		const messageEmbed = new MessageEmbed()
			.setDescription(commandContext.args.join(" "))
			.setColor(Config.color);

		commandContext.message.channel.send(messageEmbed);
	}
}