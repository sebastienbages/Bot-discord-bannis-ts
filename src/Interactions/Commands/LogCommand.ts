import { CommandInteraction, GuildMember, PermissionResolvable } from "discord.js";
import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { LogService } from "../../Services/LogService";
import { ServicesProvider } from "../../ServicesProvider";
import { InteractionError } from "../../Error/InteractionError";

export class LogCommand implements ISlashCommand {
	public readonly name: string = "log";
	public readonly description: string = "Gestionnaire de mes logs";
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";
	public readonly commandOptions: CommandOptions[] = [
		{
			type: ApplicationCommandOptionType.String,
			name: "option",
			description: "Que veux-tu faire ?",
			isRequired: true,
			choices: [
				[
					"Télécharger",
					"download",
				],
			],
		},
	];
	public readonly subCommandsOptions: SubCommandOptions[] = [];
	public logService: LogService;

	public constructor() {
		this.logService = ServicesProvider.getLogService();
	}

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		await commandInteraction.deferReply({ ephemeral: true, fetchReply: false });
		const guildMember = commandInteraction.member as GuildMember;

		if (!guildMember.permissions.has(this.permission)) {
			throw new InteractionError(
				"Tu dois être administrateur pour utiliser cette commande :smiling_imp:",
				"logCommand",
				"Droit insuffisant pour utiliser la logCommand"
			);
		}

		await guildMember.send({ files: [ this.logService.getLogFileName() ] });
		await commandInteraction.editReply({ content: "Envoyé en message privé :ok_hand:" });
		return this.logService.info(`Fichier des logs envoye a ${guildMember.displayName}`);
	}
}
