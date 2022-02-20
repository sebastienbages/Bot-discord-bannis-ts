import { CommandInteraction, PermissionResolvable, TextChannel } from "discord.js";
import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { InteractionError } from "../../Error/InteractionError";
import { LogService } from "../../Services/LogService";
import { ServicesProvider } from "../../ServicesProvider";

export class ClearCommand implements ISlashCommand {
	public readonly name: string = "effacer";
	public readonly description: string = "Je peux effacer le nombre de message(s) que tu auras choisi dans le salon où tu te situe";
	public readonly permission: PermissionResolvable = "MANAGE_MESSAGES";
	public readonly commandOptions: CommandOptions[] = [
		{
			type: ApplicationCommandOptionType.Number,
			name: "nombre",
			description: "Combien de messages ?",
			isRequired: true,
		},
	];
	public readonly subCommandsOptions: SubCommandOptions[] = [];
	public logService: LogService;

	public constructor() {
		this.logService = ServicesProvider.getLogService();
	}

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		await commandInteraction.deferReply({ ephemeral: true, fetchReply: false });
		const number = commandInteraction.options.getNumber("nombre") as number;

		if (number <= 0) {
			throw new InteractionError(
				"Le nombre doit être supérieur à zéro :face_with_raised_eyebrow:",
				commandInteraction.commandName,
				`Le nombre n'est pas superieur a zero ${number.toString()}`
			);
		}

		const channel = commandInteraction.channel as TextChannel;
		const messagesDeleted = await channel.bulkDelete(number, true);

		if (messagesDeleted.size === 0) {
			throw new InteractionError(
				"J'ai supprimé ***0 message*** :grimacing: car aucun n'est plus récent que 15 jours",
				"clearCommand",
				"Aucun message supprimé"
			);
		}

		if (messagesDeleted.size < number) {
			await commandInteraction.editReply({ content: `J'ai supprimé ***${messagesDeleted.size} message(s) sur ${number.toString()}*** :broom:` +
			"\n(les messages plus vieux de 15 jours ne peuvent pas être supprimés)" });
			return this.logService.info(`${messagesDeleted.size} message(s) supprime sur ${number.toString()} dans le salon ${channel.name}`);
		}

		if (messagesDeleted.size === number) {
			await commandInteraction.editReply({ content: `J'ai supprimé ***${messagesDeleted.size} message(s)*** :broom:` });
			return this.logService.info(`${messagesDeleted.size} message(s) supprime sur ${number.toString()} dans le salon ${channel.name}`);
		}
	}
}
