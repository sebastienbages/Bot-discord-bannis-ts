import { LogService } from "../Services/LogService";
import {
	ButtonInteraction,
	CommandInteraction,
	GuildMember,
	Interaction,
	SelectMenuInteraction,
	Snowflake,
} from "discord.js";
import { TicketService } from "../Services/TicketService";
import { ServicesProvider } from "../ServicesProvider";
import { SlashCommandService } from "../Services/SlashCommandService";
import { ISlashCommand } from "../Interfaces/ISlashCommand";
import { ButtonService } from "../Services/ButtonService";
import { IButton } from "../Interfaces/IButton";
import { SelectMenuService } from "../Services/SelectMenuService";
import { InteractionError } from "../Error/InteractionError";

export class InteractionCreateEvent {

	private logService: LogService;
	private ticketService: TicketService;
	private slashCommandService: SlashCommandService;
	private buttonService: ButtonService;
	private selectMenuService: SelectMenuService;
	private lockInteraction: Snowflake[];

	constructor() {
		this.logService = ServicesProvider.getLogService();
		this.ticketService = ServicesProvider.getTicketService();
		this.slashCommandService = ServicesProvider.getSlashCommandService();
		this.buttonService = ServicesProvider.getButtonService();
		this.selectMenuService = ServicesProvider.getSelectMenuService();
		this.lockInteraction = [];
	}

	public async run(interaction: Interaction): Promise<void> {
		const interactionObject = interaction as CommandInteraction | SelectMenuInteraction | ButtonInteraction;
		const guildMember = interaction.member as GuildMember;

		try {
			if (this.userIsLocked(guildMember.id)) {
				await interactionObject.reply({ content: "Flooder ne sert à rien ! :triumph:", ephemeral: true, fetchReply: false });
				return this.logService.info(`Le membre ${guildMember.displayName} flood les interactions`);
			}

			this.lockUser(guildMember.id);

			if (interaction.isCommand()) {
				this.logService.info(`${guildMember.displayName} a lance la commande "${interaction.commandName}"`);
				const slashCommand: ISlashCommand = this.slashCommandService.getInstance(interaction.commandName);
				await slashCommand.executeInteraction(interaction);
			}

			if (interaction.isSelectMenu()) {
				this.logService.info(`${guildMember.displayName} a utilise le select menu "${interaction.customId}"`);
				const selectMenuInstance = this.selectMenuService.getInstance(interaction.customId);
				await selectMenuInstance.executeInteraction(interaction);
			}

			if (interaction.isButton()) {
				this.logService.info(`${guildMember.displayName} a appuye sur le bouton "${interaction.customId}"`);
				const instanceButton: IButton = this.buttonService.getInstance(interaction.customId);
				await instanceButton.executeInteraction(interaction);
			}

			return this.unlockUser(guildMember.id);
		}
		catch (error) {
			if (error instanceof InteractionError) {
				const interactionError = error as InteractionError;
				await interactionObject.editReply({ content: interactionError.discordMessage });
				return this.logService.info(`Erreur de "${interactionError.name}" : ${interactionError.message}`);
			}

			if (error.name === "DiscordAPIError") {
				await interactionObject.followUp({ content: "Oups ! Une erreur s'est produite :thermometer_face: \nSi le problème persiste, merci de contacter un admin." });
			}
			else {
				await interactionObject.followUp({ content: "Oups ! Une erreur s'est produite :thermometer_face: \nSi le problème persiste, merci de contacter un admin." });
			}

			await this.logService.handlerAppError(error, interaction.client);

			return this.unlockUser(guildMember.id);
		}
	}

	/**
	 * Vérifie si un utilisateur est verrouillé
	 * @param userSnowflake
	 */
	private userIsLocked(userSnowflake: Snowflake): boolean {
		return this.lockInteraction.includes(userSnowflake);
	}

	/**
	 * Verrouille l'utilisateur
	 * @param userSnowflake
	 * @private
	 */
	private lockUser(userSnowflake: Snowflake): void {
		this.lockInteraction.push(userSnowflake);
	}

	/**
	 * Déverrouille l'utilisateur
	 * @param userSnowflake
	 * @private
	 */
	private unlockUser(userSnowflake: Snowflake): void {
		if (this.userIsLocked(userSnowflake)) {
			const userIndex = this.lockInteraction.indexOf(userSnowflake);
			this.lockInteraction.splice(userIndex, 1);
		}
	}
}
