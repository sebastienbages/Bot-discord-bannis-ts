import { IButton } from "../../Interfaces/IButton";
import {
	ButtonInteraction,
	EmojiIdentifierResolvable,
	MessageButton,
	MessageButtonStyleResolvable,
} from "discord.js";
import { TicketService } from "../../Services/TicketService";
import { ServicesProvider } from "../../ServicesProvider";

export class ReOpenTicketButton implements IButton {
	static readonly id: string = "reOpenTicket";
	static readonly label: string = "Ré-ouvrir";
	static readonly style: MessageButtonStyleResolvable = "SUCCESS";
	static readonly emoji: EmojiIdentifierResolvable = "🔓";
	static readonly button: MessageButton = new MessageButton()
		.setCustomId(this.id)
		.setLabel(this.label)
		.setStyle(this.style)
		.setEmoji(this.emoji);

	public readonly customId: string;
	public _ticketService: TicketService;

	constructor() {
		this.customId = ReOpenTicketButton.id;
		this._ticketService = ServicesProvider.getTicketService();
	}

	public async executeInteraction(buttonInteraction: ButtonInteraction): Promise<void> {
		return await this._ticketService.reOpenTicket(buttonInteraction);
	}
}
