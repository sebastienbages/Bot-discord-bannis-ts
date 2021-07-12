import { ReadyEvent } from "../Events/ReadyEvent";
import { Client } from "discord.js";
import { MessageReactionAddEvent } from "../Events/MessageReactionAdd";

export class Events {

    private _readyEvent: ReadyEvent;
    private _messageReactionAdd: MessageReactionAddEvent;

    constructor() {
        this._readyEvent = new ReadyEvent();
        this._messageReactionAdd = new MessageReactionAddEvent();
    }

    public ready() {
        return this._readyEvent;
    }

    public messageReactionAdd() {
        return this._messageReactionAdd;
    }
}