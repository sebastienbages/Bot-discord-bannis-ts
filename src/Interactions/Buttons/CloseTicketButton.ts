import { IButton } from "../../Interfaces/IButton";
import {
	ButtonInteraction,
	EmojiIdentifierResolvable,
	MessageButton,
	MessageButtonStyleResolvable,
} from "discord.js";
import { TicketService } from "../../Services/TicketService";
import { ServicesProvider } from "../../ServicesProvider";

export class CloseTicketButton implements IButton {
	public static readonly id: string = "closeTicket";
	public static readonly label: string = "Fermer";
	public static readonly style: MessageButtonStyleResolvable = "DANGER";
	public static readonly emoji: EmojiIdentifierResolvable = "🔒";
	public static readonly button: MessageButton = new MessageButton()
		.setCustomId(this.id)
		.setLabel(this.label)
		.setStyle(this.style)
		.setEmoji(this.emoji);

	public readonly customId: string;
	private ticketService: TicketService;

	constructor() {
		this.customId = CloseTicketButton.id;
		this.ticketService = ServicesProvider.getTicketService();
	}

	public async executeInteraction(buttonInteraction: ButtonInteraction): Promise<void> {
		await this.ticketService.closeTicket(buttonInteraction);
	}
}
