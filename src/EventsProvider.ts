import { ReadyEvent } from "../Events/ReadyEvent";
import { MessageReactionAddEvent } from "../Events/MessageReactionAddEvent";
import { GuildMemberAddEvent } from "../Events/GuildMemberAddEvent";
import { GuildMemberRemoveEvent } from "../Events/GuildMemberRemoveEvent";
import { InteractionCreateEvent } from "../Events/InteractionCreate";
import { MessageCreateEvent } from "../Events/MessageCreateEvent";

export class EventsProvider {
	private readonly _readyEvent: ReadyEvent;
	private readonly _messageReactionAdd: MessageReactionAddEvent;
	private readonly _guildMemberAdd: GuildMemberAddEvent;
	private readonly _guildMemberRemove: GuildMemberRemoveEvent;
	private readonly _interactionCreate: InteractionCreateEvent;
	private readonly _messageCreate: MessageCreateEvent;

	constructor() {
		this._readyEvent = new ReadyEvent();
		this._messageReactionAdd = new MessageReactionAddEvent();
		this._guildMemberAdd = new GuildMemberAddEvent();
		this._guildMemberRemove = new GuildMemberRemoveEvent();
		this._interactionCreate = new InteractionCreateEvent();
		this._messageCreate = new MessageCreateEvent();
	}

	public ready(): ReadyEvent {
		return this._readyEvent;
	}

	public messageReactionAdd(): MessageReactionAddEvent {
		return this._messageReactionAdd;
	}

	public guildMemberAdd(): GuildMemberAddEvent {
		return this._guildMemberAdd;
	}

	public guildMemberRemove(): GuildMemberRemoveEvent {
		return this._guildMemberRemove;
	}

	public interactionCreate(): InteractionCreateEvent {
		return this._interactionCreate;
	}

	public messageCreateEvent(): MessageCreateEvent {
		return this._messageCreate;
	}
}