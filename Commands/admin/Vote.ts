import { CommandOptions, ISlashCommand, SubCommandOptions } from "../ISlashCommand";
import { ServicesProvider } from "../../src/ServicesProvider";
import { CommandInteraction, PermissionResolvable } from "discord.js";
import { VoteService } from "../../Services/VoteService";

export class VoteCommand implements ISlashCommand {
	public readonly name: string = "vote";
	public readonly description: string = "Je peux envoyer le message Top Serveurs dans la taverne et je m'occuperai d'effacer le dernier";
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";
	readonly commandOptions: CommandOptions[] = [];
	readonly subCommandsOptions: SubCommandOptions[] = [];

	private _voteService: VoteService;

	constructor() {
		this._voteService = ServicesProvider.getVoteService();
	}

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		await this._voteService.sendMessage(commandInteraction.guild);
		return await commandInteraction.reply({ content: "J'ai bien envoyé le message :mechanical_arm:", ephemeral: true, fetchReply: false });
	}
}