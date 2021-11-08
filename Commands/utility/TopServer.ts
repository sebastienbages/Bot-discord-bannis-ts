import { Message, PermissionResolvable } from "discord.js";
import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { ServiceProvider } from "../../src/ServiceProvider";
import { Player } from "../../Models/TopServerModel";
import { TopServerService } from "../../Services/TopServerService";
import * as fs from "fs/promises";

export class TopServerCommand implements ICommand {
	public readonly name: string = "topserveur";
	public readonly aliases: string[] = [ "classement" ];
	public readonly argumentIsNecessary: boolean = false;
	public readonly description: string = "Envoi le classement des votes de Top serveur du mois dernier ou courant";
	public readonly usage: string = "[last] (option facultative)";
	public readonly guildOnly: boolean = false;
	public readonly cooldown: number = 30;
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";

	private _topServerService: TopServerService;

	constructor() {
		this._topServerService = ServiceProvider.getTopServerService();
	}

	async run(commandContext: CommandContext): Promise<void> {
		const args: string[] = commandContext.args;
		const message: Message = commandContext.message;

		let title: string;
		let players: Array<Player>;

		const option: string = args[0];

		if (option === "last") {
			players = await this._topServerService.getPlayersRanking(false);
			title = "Classement Top Serveur du mois dernier";
		}
		else {
			players = await this._topServerService.getPlayersRanking(true);
			title = "Classement Top Serveur du mois en cours";
		}

		const fileName: string = this._topServerService.fileName;
		await this._topServerService.createRankingFile(players);
		await message.author.send({ files: [ fileName ], content: title });
		await fs.rm(fileName);
	}
}