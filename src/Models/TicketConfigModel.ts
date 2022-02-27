import { Snowflake } from "discord.js";

export class TicketConfig {
	public last_number: number;
	public message_id: Snowflake;
	public category_id: Snowflake;
	public channel_id: Snowflake;
}
