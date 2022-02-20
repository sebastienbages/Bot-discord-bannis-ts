import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { CommandInteraction, GuildMember, PermissionResolvable } from "discord.js";
import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { LogService } from "../../Services/LogService";
import { ServicesProvider } from "../../ServicesProvider";

export class SayPrivCommand implements ISlashCommand {
	public readonly name: string = "message-prive";
	public readonly description: string = "Je peux envoyer un message privé à  un utilisateur";
	public readonly permission: PermissionResolvable = "MANAGE_MESSAGES";
	public readonly commandOptions: CommandOptions[] = [
		{
			type: ApplicationCommandOptionType.User,
			name: "utilisateur",
			description: "A quel utilisateur ?",
			isRequired: true,
		},
		{
			type: ApplicationCommandOptionType.String,
			name: "message",
			description: "Que est ton message ?",
			isRequired: true,
		},
	];
	public readonly subCommandsOptions: SubCommandOptions[] = [];

	private logService: LogService;

	public constructor() {
		this.logService = ServicesProvider.getLogService();
	}

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		await commandInteraction.deferReply({ ephemeral: true, fetchReply: false });
		const message = commandInteraction.options.getString("message") as string;
		const guildMember = commandInteraction.options.getMember("utilisateur") as GuildMember;
		await guildMember.send({ content: message });
		await commandInteraction.editReply({ content: "Je lui ai bien envoyé le message en privé :shushing_face:" });
		return this.logService.info(`Message : "${message}" - Envoye en prive a ${guildMember.displayName}`);
	}
}
