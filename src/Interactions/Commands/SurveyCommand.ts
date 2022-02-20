import {
	CommandInteraction,
	MessageAttachment,
	MessageEmbed,
	PermissionResolvable,
	TextChannel,
} from "discord.js";
import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { Config } from "../../Config/Config";
import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { InteractionError } from "../../Error/InteractionError";
import { LogService } from "../../Services/LogService";
import { ServicesProvider } from "../../ServicesProvider";

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

	private logService: LogService;

	public constructor() {
		this.logService = ServicesProvider.getLogService();
	}

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		await commandInteraction.deferReply({ ephemeral: true, fetchReply: false });
		const sondageChannel = commandInteraction.guild.channels.cache.find(channel => channel.id === Config.surveyChannelId) as TextChannel;

		if (!sondageChannel) {
			throw new InteractionError(
				"Le channel des sondages est introuvable :face_with_monocle:",
				commandInteraction.commandName,
				"Le channel des sondages est inconnu ou inexistant"
			);
		}

		const messageToSend: string = commandInteraction.options.getString("question");

		const image = new MessageAttachment(Config.imageDir + "/image-survey.png");
		const messageEmbed = new MessageEmbed()
			.setTitle("SONDAGE")
			.setThumbnail("attachment://image-survey.png")
			.setDescription(`<@&${Config.roleStartId}> \n ${messageToSend}`)
			.setColor(Config.color);

		const survey = await sondageChannel.send({ embeds: [ messageEmbed ], files: [ image ] });
		await survey.react("👍");
		await survey.react("👎");

		await commandInteraction.editReply({ content: "J'ai bien envoyé le sondage :blush:" });
		return this.logService.info(`Sondage : "${messageToSend}" publie`);
	}
}
