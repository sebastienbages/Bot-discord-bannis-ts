import { IButton } from "../../Interfaces/IButton";
import {
	ButtonInteraction,
	EmojiIdentifierResolvable,
	MessageActionRow,
	MessageButton,
	MessageButtonStyleResolvable,
} from "discord.js";
import { TicketService } from "../../Services/TicketService";
import { ServicesProvider } from "../../src/ServicesProvider";

export class CloseTicketButton implements IButton {
	static readonly id: string = "closeTicket";
	static readonly label: string = "Fermer";
	static readonly style: MessageButtonStyleResolvable = "DANGER";
	static readonly emoji: EmojiIdentifierResolvable = "🔒";
	static readonly button: MessageButton = new MessageButton()
		.setCustomId(this.id)
		.setLabel(this.label)
		.setStyle(this.style)
		.setEmoji(this.emoji);

	public readonly customId: string;
	private _ticketService: TicketService;

	constructor() {
		this.customId = CloseTicketButton.id;
		this._ticketService = ServicesProvider.getTicketService();
	}

	public async executeInteraction(buttonInteraction: ButtonInteraction): Promise<void> {
		await this._ticketService.closeTicket(buttonInteraction);
		const components = buttonInteraction.message.components as MessageActionRow[];
		components[0].components[0].setDisabled();
		return buttonInteraction.update({ components: components });
	}
}