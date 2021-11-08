import {
	Message,
	MessageAttachment,
	MessageEmbed,
	PermissionResolvable,
	TextChannel,
} from "discord.js";
import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { Config } from "../../Config/Config";
import { DiscordHelper } from "../../Helper/DiscordHelper";

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
			const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Le channel des sondages est introuvable");
			return DiscordHelper.deleteMessage(response, 5000);
		}

		const messageToSend: string = args.join(" ");

		const image = new MessageAttachment("./Images/image-survey.png");
		const messageEmbed = new MessageEmbed()
			.setTitle("SONDAGE")
			.setThumbnail("attachment://image-survey.png")
			.setDescription(messageToSend)
			.setColor(Config.color);

		const survey = await sondageChannel.send({ embeds: [ messageEmbed ], files: [ image ] });
		await survey.react("👍");
		await survey.react("👎");
	}
}