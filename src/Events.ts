import { ReadyEvent } from "../Events/ReadyEvent";
import { MessageReactionAddEvent } from "../Events/MessageReactionAddEvent";
import { GuildMemberAddEvent } from "../Events/GuildMemberAddEvent";
import { GuildMemberRemoveEvent } from "../Events/GuildMemberRemoveEvent";

export class Events {
	private readonly _readyEvent: ReadyEvent;
	private readonly _messageReactionAdd: MessageReactionAddEvent;
	private readonly _guildMemberAdd: GuildMemberAddEvent;
	private readonly _guildMemberRemove: GuildMemberRemoveEvent;

	constructor() {
		this._readyEvent = new ReadyEvent();
		this._messageReactionAdd = new MessageReactionAddEvent();
		this._guildMemberAdd = new GuildMemberAddEvent();
		this._guildMemberRemove = new GuildMemberRemoveEvent();
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
}