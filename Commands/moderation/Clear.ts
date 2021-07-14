import { Message, MessageEmbed, PermissionResolvable, TextChannel } from "discord.js";
import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { Config } from "../../Config/Config";

export class ClearCommand implements ICommand {
	public readonly name: string = "clear";
	public readonly aliases: string[] = [ "effacer", "nettoyer" ];
	public readonly argumentIsNecessary: boolean = true;
	public readonly description: string = "Efface le nombre de message spécifié dans le salon visé";
	public readonly usage: string = "<nombre>";
	public readonly guildOnly: boolean = true;
	public readonly cooldown: number = 5;
	public readonly permission: PermissionResolvable = "MANAGE_MESSAGES";

	async run(commandContext: CommandContext): Promise<void> {
		const message: Message = commandContext.message;
		const channel = message.channel as TextChannel;
		const args: string[] = commandContext.args;

		try {
			await channel.bulkDelete(parseInt(args[0]), true);

			const messageEmbed = new MessageEmbed()
				.setColor(Config.color)
				.setDescription(`J'ai supprimé ***${args[0]} message(s)***`);

			const response: Message = await message.channel.send(messageEmbed);
			response.delete({ timeout: 10000 });
		}
		catch (error) {
			message.reply("je ne peux pas effacer ce nombre de messages");
		}
	}
}