import { SelectMenuInteraction } from "discord.js";

export interface ISelectMenu {
	readonly customId: string;
	executeInteraction(selectMenuInteraction: SelectMenuInteraction): Promise<void>;
}