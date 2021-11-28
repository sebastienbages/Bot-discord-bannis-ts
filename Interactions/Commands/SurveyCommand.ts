import {
	CommandInteraction,
	MessageAttachment,
	MessageEmbed,
	PermissionResolvable,
	TextChannel,
} from "discord.js";
import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { Config } from "../../Config/Config";
import { ApplicationCommandOptionType } from "discord-api-types";

export class SurveyCommand implements ISlashCommand {
	public readonly name: string = "sondage";
	public readonly description: string = "Rédige ta question et j'enverrai un sondage dans le bon channel";
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";
	public readonly subCommandsOptions: SubCommandOptions[] = [];
	public readonly commandOptions: CommandOptions[] = [
		{
			type: ApplicationCommandOptionType.String,
			name: "question",
			description: "La question à poser...",
			isRequired: true,
		},
	];

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		const sondageChannel = commandInteraction.guild.channels.cache.find(channel => channel.id === Config.surveyChannelId) as TextChannel;

		if (!sondageChannel) {
			await commandInteraction.reply({ content: "Le channel des sondages est introuvable", ephemeral: true });
		}

		const messageToSend: string = commandInteraction.options.data[0].value as string;

		const image = new MessageAttachment("./Images/image-survey.png");
		const messageEmbed = new MessageEmbed()
			.setTitle("SONDAGE")
			.setThumbnail("attachment://image-survey.png")
			.setDescription(`<@&${Config.roleStart}> \n ${messageToSend}`)
			.setColor(Config.color);

		const survey = await sondageChannel.send({ embeds: [ messageEmbed ], files: [ image ] });
		await survey.react("👍");
		await survey.react("👎");

		return await commandInteraction.reply({ content: "J'ai bien envoyé le sondage :blush:", ephemeral: true, fetchReply: false });
	}
}