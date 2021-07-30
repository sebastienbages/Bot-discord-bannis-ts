import { Message, PermissionResolvable } from "discord.js";
import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { ServiceProvider } from "../../src/ServiceProvider";
import { Player } from "../../Models/TopServerModel";
import { TopServerService } from "../../Services/TopServerService";
import * as fs from "fs";

export class TopServerCommand implements ICommand {
	public readonly name: string = "topserveur";
	public readonly aliases: string[] = [ "classement" ];
	public readonly argumentIsNecessary: boolean = false;
	public readonly description: string = "Envoi le classement des votes de Top serveur du mois dernier ou courant";
	public readonly usage: string = "[last] (option facultative)";
	public readonly guildOnly: boolean = false;
	public readonly cooldown: number = 30;
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";

	async run(commandContext: CommandContext): Promise<void> {
		const args: string[] = commandContext.args;
		const message: Message = commandContext.message;
		const topServerService: TopServerService = ServiceProvider.getTopServerService();

		let title: string;
		let players: Array<Player>;

		const option: string = args[0];

		if (option === "last") {
			players = await topServerService.getPlayersRanking(false);
			title = "Classement Top Serveur du mois dernier";
		}
		else {
			players = await topServerService.getPlayersRanking(true);
			title = "Classement Top Serveur du mois en cours";
		}

		const fileName: string = topServerService.fileName;
		await topServerService.createRankingFile(players);
		await message.author.send(title, { files: [fileName] });
		fs.rm(fileName, err => {
			if (err) console.error(err);
		});
	}
}