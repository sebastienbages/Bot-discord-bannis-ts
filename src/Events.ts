import { ReadyEvent } from "../Events/ReadyEvent";
import { Client } from "discord.js";

export class Events {

    private readyEvent: ReadyEvent;

    constructor(client: Client) {
        this.readyEvent = new ReadyEvent();
    }

    ready() {
        return this.readyEvent;
    }
}