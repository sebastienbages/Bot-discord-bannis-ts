import { Snowflake } from "discord.js";

export class MessageModel {
	public name: string;
	public message_id: Snowflake;
	public channel_id: Snowflake;
}
