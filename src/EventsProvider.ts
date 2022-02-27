import { ReadyEvent } from "./Events/ReadyEvent";
import { GuildMemberAddEvent } from "./Events/GuildMemberAddEvent";
import { GuildMemberRemoveEvent } from "./Events/GuildMemberRemoveEvent";
import { InteractionCreateEvent } from "./Events/InteractionCreate";
import { MessageCreateEvent } from "./Events/MessageCreateEvent";

export class EventsProvider {
	private static readyEvent: ReadyEvent;
	private static guildMemberAddEvent: GuildMemberAddEvent;
	private static guildMemberRemoveEvent: GuildMemberRemoveEvent;
	private static interactionCreateEvent: InteractionCreateEvent;
	private static messageCreateEvent: MessageCreateEvent;

	public static initializeEvents(): void {
		this.readyEvent = new ReadyEvent();
		this.guildMemberAddEvent = new GuildMemberAddEvent();
		this.guildMemberRemoveEvent = new GuildMemberRemoveEvent();
		this.interactionCreateEvent = new InteractionCreateEvent();
		this.messageCreateEvent = new MessageCreateEvent();
	}

	public static getReadyEvent(): ReadyEvent {
		return this.readyEvent;
	}

	public static getGuildMemberAddEvent(): GuildMemberAddEvent {
		return this.guildMemberAddEvent;
	}

	public static getGuildMemberRemoveEvent(): GuildMemberRemoveEvent {
		return this.guildMemberRemoveEvent;
	}

	public static getInteractionCreateEvent(): InteractionCreateEvent {
		return this.interactionCreateEvent;
	}

	public static getMessageCreateEvent(): MessageCreateEvent {
		return this.messageCreateEvent;
	}
}
