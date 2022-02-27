import { CommandInteraction, MessageEmbed, PermissionResolvable, TextChannel } from "discord.js";
import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { Config } from "../../Config/Config";
import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { InteractionError } from "../../Error/InteractionError";
import { LogService } from "../../Services/LogService";
import { ServicesProvider } from "../../ServicesProvider";

export class SayCommand implements ISlashCommand {
	public readonly name: string = "message";
	public readonly description: string = "Je peux envoyer un message dans le channel où tu te situe";
	public readonly permission: PermissionResolvable = "MANAGE_MESSAGES";
	public readonly commandOptions: CommandOptions[] = [
		{
			type: ApplicationCommandOptionType.String,
			name: "ecriture",
			description: "Quel style d'écriture ?",
			isRequired: true,
			choices: [
				[
					"Enrichi",
					"enrichi",
				],
				[
					"Normal",
					"normal",
				],
			],
		},
		{
			type: ApplicationCommandOptionType.String,
			name: "message",
			description: "Quel est ton message ?",
			isRequired: true,
		},
	];
	public readonly subCommandsOptions: SubCommandOptions[] = [];

	private logService: LogService;

	public constructor() {
		this.logService = ServicesProvider.getLogService();
	}

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		await commandInteraction.deferReply({ fetchReply: false });
		const textChannel = commandInteraction.channel as TextChannel;

		if (textChannel.type !== "GUILD_TEXT") {
			throw new InteractionError(
				"Choisi un channel textuel voyons :grin:",
				commandInteraction.commandName,
				`Le channel ${textChannel.name} ne possede pas le bon type`
			);
		}

		const option = commandInteraction.options.getString("ecriture");
		const message = commandInteraction.options.getString("message");

		if (option === "enrichi") {
			const messageEmbed = new MessageEmbed()
				.setDescription(message)
				.setColor(Config.color);
			await textChannel.send({ embeds: [ messageEmbed ] });
		}

		if (option === "normal") {
			await textChannel.send({ content: message });
		}

		await commandInteraction.deleteReply();
		return this.logService.info(`Texte : "${message}" envoye dans le salon ${textChannel.name}`);
	}
}
