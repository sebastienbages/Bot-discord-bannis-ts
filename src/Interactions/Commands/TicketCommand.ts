import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { ServicesProvider } from "../../ServicesProvider";
import { CommandInteraction, PermissionResolvable } from "discord.js";
import { TicketService } from "../../Services/TicketService";
import { ApplicationCommandOptionType } from "discord-api-types/v9";

export class TicketCommand implements ISlashCommand {
	public readonly name: string = "ticket";
	public readonly description: string = "Outils de gestion des tickets";
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";
	public readonly commandOptions: CommandOptions[] = [
		{
			type: ApplicationCommandOptionType.String,
			name: "option",
			description: "Que veux tu faire ?",
			isRequired: true,
			choices: [
				[
					"Envoyer le message pilote",
					"msg_pilote",
				],
			],
		},
		{
			type: ApplicationCommandOptionType.Channel,
			name: "channel",
			description: "Dans quel Channel ? (texte uniquement)",
			isRequired: true,
		},
	];
	public readonly subCommandsOptions: SubCommandOptions[] = [];

	private ticketService: TicketService;

	constructor() {
		this.ticketService = ServicesProvider.getTicketService();
	}

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		const option = commandInteraction.options.getString("option");

		if (option === "msg_pilote") {
			await this.ticketService.sendTicketMessage(commandInteraction);
		}
	}
}
