import { CommandInteraction, MessageEmbed, PermissionResolvable, TextChannel } from "discord.js";
import { CommandOptions, ISlashCommand, SubCommandOptions } from "../ISlashCommand";
import { Config } from "../../Config/Config";
import { ApplicationCommandOptionType } from "discord-api-types";

export class SayCommand implements ISlashCommand {
	public readonly name: string = "message";
	public readonly description: string = "Je peux envoyer un message dans le channel où tu te situe";
	public readonly permission: PermissionResolvable = "MANAGE_MESSAGES";
	readonly commandOptions: CommandOptions[] = [
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
	readonly subCommandsOptions: SubCommandOptions[] = [];

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		const option = commandInteraction.options.getString("ecriture");
		const message = commandInteraction.options.getString("message");
		const textChannel = commandInteraction.channel as TextChannel;

		if (option === "enrichi") {
			const messageEmbed = new MessageEmbed()
				.setDescription(message)
				.setColor(Config.color);
			await textChannel.send({ embeds: [ messageEmbed ] });
		}

		if (option === "normal") {
			await textChannel.send({ content: message });
		}

		return await commandInteraction.reply({ content: "TA-DA ! :magic_wand:", ephemeral: true, fetchReply: false });
	}
}