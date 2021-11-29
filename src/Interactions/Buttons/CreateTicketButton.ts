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
	static readonly id: string = "createTicket";
	static readonly label: string = "Créer ticket";
	static readonly style: MessageButtonStyleResolvable = "PRIMARY";
	static readonly emoji: EmojiIdentifierResolvable = "🎫";
	static readonly button: MessageButton = new MessageButton()
		.setCustomId(this.id)
		.setLabel(this.label)
		.setStyle(this.style)
		.setEmoji(this.emoji);

	public readonly customId: string;
	private _ticketService: TicketService;

	constructor() {
		this.customId = CreateTicketButton.id;
		this._ticketService = ServicesProvider.getTicketService();
	}

	public async executeInteraction(buttonInteraction: ButtonInteraction): Promise<void> {
		return await this._ticketService.createTicket(buttonInteraction);
	}
}
