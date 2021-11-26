import { CommandInteraction, PermissionResolvable } from "discord.js";
import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { ServicesProvider } from "../../src/ServicesProvider";
import { Player } from "../../Models/TopServerModel";
import { TopServerService } from "../../Services/TopServerService";
import * as fs from "fs/promises";
import { ApplicationCommandOptionType } from "discord-api-types";

export class TopServerCommand implements ISlashCommand {
	public readonly name: string = "top-serveur";
	public readonly description: string = "Je peux t'envoyer le classement des votes sur Top serveur";
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";
	readonly commandOptions: CommandOptions[] = [
		{
			type: ApplicationCommandOptionType.String,
			name: "option",
			description: "Quel classement veux-tu ?",
			isRequired: true,
			choices: [
				[
					"Ce mois-ci",
					"courant",
				],
				[
					"Le mois dernier",
					"dernier",
				],
			],
		},
	];
	readonly subCommandsOptions: SubCommandOptions[] = [];

	private _topServerService: TopServerService;

	constructor() {
		this._topServerService = ServicesProvider.getTopServerService();
	}

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		let title: string;
		let players: Array<Player>;
		const option = commandInteraction.options.getString("option") as string;

		if (option === "dernier") {
			players = await this._topServerService.getPlayersRanking(false);
			title = "Classement Top Serveur du mois dernier";
		}

		if (option === "courant") {
			players = await this._topServerService.getPlayersRanking(true);
			title = "Classement Top Serveur du mois en cours";
		}

		const fileName: string = this._topServerService.fileName;
		await this._topServerService.createRankingFile(players);
		await commandInteraction.user.send({ files: [ fileName ], content: title });
		await fs.rm(fileName);
		return await commandInteraction.reply({ content: "Je t'ai envoyé le classement en privé :wink:", ephemeral: true, fetchReply: false });
	}
}