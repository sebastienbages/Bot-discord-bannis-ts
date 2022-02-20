import { IButton } from "../../Interfaces/IButton";
import {
	ButtonInteraction,
	EmojiIdentifierResolvable,
	MessageButton,
	MessageButtonStyleResolvable,
} from "discord.js";
import { TicketService } from "../../Services/TicketService";
import { ServicesProvider } from "../../ServicesProvider";

export class CreateTicketButton implements IButton {
	public static readonly id: string = "createTicket";
	public static readonly label: string = "Créer ticket";
	public static readonly style: MessageButtonStyleResolvable = "PRIMARY";
	public static readonly emoji: EmojiIdentifierResolvable = "🎫";
	public static readonly button: MessageButton = new MessageButton()
		.setCustomId(this.id)
		.setLabel(this.label)
		.setStyle(this.style)
		.setEmoji(this.emoji);

	public readonly customId: string;
	private ticketService: TicketService;

	constructor() {
		this.customId = CreateTicketButton.id;
		this.ticketService = ServicesProvider.getTicketService();
	}

	public async executeInteraction(buttonInteraction: ButtonInteraction): Promise<void> {
		return await this.ticketService.createTicket(buttonInteraction);
	}
}
