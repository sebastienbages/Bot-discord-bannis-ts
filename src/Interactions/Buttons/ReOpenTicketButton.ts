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
	public static readonly id: string = "reOpenTicket";
	public static readonly label: string = "Ré-ouvrir";
	public static readonly style: MessageButtonStyleResolvable = "SUCCESS";
	public static readonly emoji: EmojiIdentifierResolvable = "🔓";
	public static readonly button: MessageButton = new MessageButton()
		.setCustomId(this.id)
		.setLabel(this.label)
		.setStyle(this.style)
		.setEmoji(this.emoji);

	public readonly customId: string;
	public ticketService: TicketService;

	constructor() {
		this.customId = ReOpenTicketButton.id;
		this.ticketService = ServicesProvider.getTicketService();
	}

	public async executeInteraction(buttonInteraction: ButtonInteraction): Promise<void> {
		return await this.ticketService.reOpenTicket(buttonInteraction);
	}
}
