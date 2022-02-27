import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { CommandInteraction, GuildMember, PermissionResolvable } from "discord.js";
import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { GameServersService } from "../../Services/GameServersService";
import fs from "fs/promises";
import { PlayerModel } from "../../Models/PlayerModel";
import { ServicesProvider } from "../../ServicesProvider";

export class GameServersCommand implements ISlashCommand {
	public readonly name: string = "joueurs-connectes";
	public readonly description: string = "Je peux envoyer la liste des joueurs connectés sur les serveurs disponibles";
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";
	public readonly commandOptions: CommandOptions[] = [
		{
			type: ApplicationCommandOptionType.String,
			name: "option",
			description: "De quel serveur ?",
			isRequired: true,
			choices: [
				[
					"Serveur principal",
					"main_server",
				],
			],
		},
	];
	public readonly subCommandsOptions: SubCommandOptions[] = [];

	private gameServersService: GameServersService;

	constructor() {
		this.gameServersService = ServicesProvider.getGameServersService();
	}

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		await commandInteraction.deferReply({ ephemeral: true, fetchReply: false });
		const member = commandInteraction.member as GuildMember;
		const option = commandInteraction.options.getString("option") as string;

		const sendPrivateMessage = async (playersModels: PlayerModel[], fileName: string, title: string) => {
			if (playersModels.length === 0) {
				await commandInteraction.editReply({ content: "Il n'y a aucun joueur connecté :confused:" });
				return;
			}
			await this.gameServersService.createFile(playersModels, fileName);
			await member.send({ files: [ fileName ], content: title });
			await fs.rm(fileName);
			await commandInteraction.editReply({ content: "Je t'ai envoyé la liste en privé :wink:" });
		};

		if (option === "main_server") {
			const playerModels = await this.gameServersService.getPlayers();
			await sendPrivateMessage(playerModels, "players-main-server.txt", "Joueurs connectes SERVEUR PRINCIPAL");
		}
	}
}
