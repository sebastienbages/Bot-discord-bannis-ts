import { CommandOptions, ISlashCommand, SubCommandOptions } from "../ISlashCommand";
import { CommandInteraction, GuildMember, PermissionResolvable } from "discord.js";
import { ApplicationCommandOptionType } from "discord-api-types";

export class SayPrivCommand implements ISlashCommand {
	public readonly name: string = "message-prive";
	public readonly description: string = "Je peux envoyer un message privé à  un utilisateur";
	public readonly permission: PermissionResolvable = "MANAGE_MESSAGES";
	readonly commandOptions: CommandOptions[] = [
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
	readonly subCommandsOptions: SubCommandOptions[] = [];

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		const message = commandInteraction.options.getString("message") as string;
		const guildMember = commandInteraction.options.getMember("utilisateur") as GuildMember;
		await guildMember.send({ content: message });
		return await commandInteraction.reply({ content: "Je lui ai bien envoyé le message en privé :shushing_face:", ephemeral: true, fetchReply: false });
	}
}