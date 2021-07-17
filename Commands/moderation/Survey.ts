import { Message, MessageEmbed, PermissionResolvable, TextChannel } from "discord.js";
import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { Config } from "../../Config/Config";

export class SurveyCommand implements ICommand {
	public readonly name: string = "survey";
	public readonly aliases: string[] = [ "question", "sondage" ];
	public readonly argumentIsNecessary: boolean = true;
	public readonly description: string = "Créé un sondage dans le salon des sondages";
	public readonly usage: string = "<question>";
	public readonly guildOnly: boolean = true;
	public readonly cooldown: number = 0;
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";

	async run(commandContext: CommandContext): Promise<void> {
		const message: Message = commandContext.message;
		const args: string[] = commandContext.args;
		const sondageChannel = message.guild.channels.cache.find(channel => channel.id === Config.surveyChannelId) as TextChannel;

		if (!sondageChannel) {
			const response: Message = await message.reply("le channel des sondages est introuvable");
			await response.delete({ timeout: 5000 });
			return undefined;
		}

		const messageToSend: string = args.join(" ");

		const messageEmbed = new MessageEmbed()
			.setTitle("SONDAGE")
			.attachFiles(["Images/point-d-interrogation.jpg"])
			.setThumbnail("attachment://point-d-interrogation.jpg")
			.setDescription(messageToSend)
			.setColor(Config.color)
			.setFooter("Répondez en cliquant sur les réactions ci-dessous :");

		const survey = await sondageChannel.send(messageEmbed);
		await survey.react("✅");
		await survey.react("❌");
	}
}