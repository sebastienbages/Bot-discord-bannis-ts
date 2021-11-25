import { CommandInteraction, PermissionResolvable, TextChannel } from "discord.js";
import { CommandOptions, ISlashCommand, SubCommandOptions } from "../ISlashCommand";
import { ApplicationCommandOptionType } from "discord-api-types";

export class ClearCommand implements ISlashCommand {
	public readonly name: string = "effacer";
	public readonly description: string = "Je peux effacer le nombre de message(s) que tu auras choisi dans le salon où tu te situe";
	public readonly permission: PermissionResolvable = "MANAGE_MESSAGES";
	readonly commandOptions: CommandOptions[] = [
		{
			type: ApplicationCommandOptionType.Number,
			name: "nombre",
			description: "Combien de messages ?",
			isRequired: true,
		},
	];
	readonly subCommandsOptions: SubCommandOptions[] = [];

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		const number = commandInteraction.options.getNumber("nombre") as number;
		const channel = commandInteraction.channel as TextChannel;
		try {
			await channel.bulkDelete(number, true);
			return await commandInteraction.reply({ content: `J'ai supprimé ***${number.toString()} message(s)*** :broom:`, ephemeral: true, fetchReply: false });
		}
		catch (error) {
			throw Error("Je n'arrive pas à supprimer tous les messages :weary:");
		}
	}
}