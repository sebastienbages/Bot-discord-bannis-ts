import { CommandInteraction, PermissionResolvable } from "discord.js";
import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { ServicesProvider } from "../../ServicesProvider";
import { TopServerService } from "../../Services/TopServerService";
import * as fs from "fs/promises";
import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { LogService } from "../../Services/LogService";

export class TopServerCommand implements ISlashCommand {
	public readonly name: string = "top-serveur";
	public readonly description: string = "Je peux t'envoyer le classement des votes sur Top serveur";
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";
	public readonly commandOptions: CommandOptions[] = [
		{
			type: ApplicationCommandOptionType.String,
			name: "option",
			description: "Quel classement veux-tu ?",
			isRequired: true,
			choices: [
				[
					"Ce mois-ci",
					"current_month",
				],
				[
					"Le mois dernier",
					"last_month",
				],
			],
		},
	];
	public readonly subCommandsOptions: SubCommandOptions[] = [];

	private topServerService: TopServerService;
	private logService: LogService;

	constructor() {
		this.topServerService = ServicesProvider.getTopServerService();
		this.logService = ServicesProvider.getLogService();
	}

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		await commandInteraction.deferReply({ ephemeral: true, fetchReply: false });
		const option = commandInteraction.options.getString("option") as string;

		if (option === "current_month") {
			const playerRanking = await this.topServerService.getPlayersRankingForCurrentMonth();
			const title = "Classement Top Serveur du mois en cours";
			await this.topServerService.createRankingFile(playerRanking.players);
			await commandInteraction.user.send({ files: [ TopServerService.fileName ], content: title });
			this.logService.info("Classement des votes du mois courant envoye");
		}

		if (option === "last_month") {
			const playerRanking = await this.topServerService.getPlayersRankingForLastMonth();
			const title = "Classement Top Serveur du mois dernier";
			await this.topServerService.createRankingFile(playerRanking.players);
			await commandInteraction.user.send({ files: [ TopServerService.fileName ], content: title });
			this.logService.info("Classement des votes du mois dernier envoye");
		}

		await commandInteraction.editReply({ content: "Je t'ai envoyé le classement en privé :wink:" });
		await fs.rm(TopServerService.fileName);
		return this.logService.info(`Fichier ${TopServerService.fileName} supprime`);
	}
}
