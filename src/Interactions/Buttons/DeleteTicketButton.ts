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
	public static readonly id: string = "deleteTicket";
	public static readonly label: string = "Supprimer";
	public static readonly style: MessageButtonStyleResolvable = "DANGER";
	public static readonly emoji: EmojiIdentifierResolvable = "🧹";
	public static readonly button: MessageButton = new MessageButton()
		.setCustomId(this.id)
		.setLabel(this.label)
		.setStyle(this.style)
		.setEmoji(this.emoji);

	public readonly customId: string;
	private ticketService: TicketService;

	constructor() {
		this.customId = DeleteTicketButton.id;
		this.ticketService = ServicesProvider.getTicketService();
	}

	public async executeInteraction(buttonInteraction: ButtonInteraction): Promise<void> {
		return await this.ticketService.deleteTicket(buttonInteraction);
	}
}
