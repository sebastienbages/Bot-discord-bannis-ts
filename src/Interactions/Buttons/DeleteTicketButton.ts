import { IButton } from "../../Interfaces/IButton";
import {
	ButtonInteraction,
	EmojiIdentifierResolvable,
	MessageButton,
	MessageButtonStyleResolvable,
} from "discord.js";
import { TicketService } from "../../Services/TicketService";
import { ServicesProvider } from "../../ServicesProvider";

export class DeleteTicketButton implements IButton {
	static readonly id: string = "deleteTicket";
	static readonly label: string = "Supprimer";
	static readonly style: MessageButtonStyleResolvable = "DANGER";
	static readonly emoji: EmojiIdentifierResolvable = "🧹";
	static readonly button: MessageButton = new MessageButton()
		.setCustomId(this.id)
		.setLabel(this.label)
		.setStyle(this.style)
		.setEmoji(this.emoji);

	public readonly customId: string;
	private _ticketService: TicketService;

	constructor() {
		this.customId = DeleteTicketButton.id;
		this._ticketService = ServicesProvider.getTicketService();
	}

	public async executeInteraction(buttonInteraction: ButtonInteraction): Promise<void> {
		return await this._ticketService.deleteTicket(buttonInteraction);
	}
}
