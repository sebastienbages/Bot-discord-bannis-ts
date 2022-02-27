import { Client, Intents } from "discord.js";
import { EventsProvider } from "./EventsProvider";

export class Bot extends Client {
	constructor(token: string) {
		super({
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
		this.token = token;
	}

	public async start(): Promise<void> {
		this.once("ready", async (client: Client) => await EventsProvider.getReadyEvent().run(client));
		await this.login(this.token);
	}
}
