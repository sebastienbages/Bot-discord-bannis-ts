import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { ServiceProvider } from "../../src/ServiceProvider";
import { PermissionResolvable } from "discord.js";
import { VoteService } from "../../Services/VoteService";

export class VoteCommand implements ICommand {
	public readonly name: string = "vote";
	public readonly aliases: string[] = [];
	public readonly argumentIsNecessary: boolean = false;
	public readonly description: string = "Envoi un message d'appel aux votes en utilisant le WebHook Gardien des votes";
	public readonly usage: string = "[nom de la commande]";
	public readonly guildOnly: boolean = true;
	public readonly cooldown: number = 0;
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";

	private _voteService: VoteService;

	constructor() {
		this._voteService = ServiceProvider.getVoteService();
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async run(commandContext: CommandContext): Promise<void> {
		await this._voteService.sendMessage();
	}
}