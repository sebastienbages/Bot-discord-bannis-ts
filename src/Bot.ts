import { Client, Intents } from "discord.js";
import { EventsProvider } from "./EventsProvider";
import { LogService } from "./Services/LogService";

export class Bot {
	public client: Client;
	private readonly token: string;
	private events: EventsProvider;
	private _logService: LogService;

	constructor(token: string, events: EventsProvider) {
		this.client = new Client({
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_WEBHOOKS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
				Intents.FLAGS.GUILD_INTEGRATIONS,
				Intents.FLAGS.GUILD_PRESENCES,
				Intents.FLAGS.DIRECT_MESSAGES,
				Intents.FLAGS.DIRECT_MESSAGE_TYPING,
				Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
				Intents.FLAGS.GUILD_BANS,
				Intents.FLAGS.GUILD_INVITES,
				Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
				Intents.FLAGS.GUILD_VOICE_STATES,
			],
			partials: [ "MESSAGE", "CHANNEL", "REACTION" ],
		});
		this.events = events;
		this._logService = new LogService();
		this.token = token;
	}

	start(): void {
		this.events.ready().run(this.client);
		this.client.login(this.token).then(() => this._logService.log("Le Bot est en ligne"));
	}
}
