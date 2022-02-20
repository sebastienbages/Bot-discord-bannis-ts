import { Snowflake } from "discord.js";

export class TicketModel {
	public userid: Snowflake;
	public number: number;
	public isclosed: boolean;
}
