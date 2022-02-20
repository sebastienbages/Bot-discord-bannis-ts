import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { ServicesProvider } from "../../ServicesProvider";
import { CommandInteraction, PermissionResolvable } from "discord.js";
import { VoteService } from "../../Services/VoteService";

export class VoteCommand implements ISlashCommand {
	public readonly name: string = "vote";
	public readonly description: string = "Je peux envoyer le message Top Serveurs dans la taverne et je m'occuperai d'effacer le dernier";
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";
	readonly commandOptions: CommandOptions[] = [];
	readonly subCommandsOptions: SubCommandOptions[] = [];

	private voteService: VoteService;

	constructor() {
		this.voteService = ServicesProvider.getVoteService();
	}

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		await commandInteraction.deferReply({ ephemeral: true, fetchReply: false });
		await this.voteService.sendMessage(commandInteraction.guild, true);
		await commandInteraction.editReply({ content: "J'ai bien envoyé le message :mechanical_arm:" });
	}
}
