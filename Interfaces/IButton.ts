import {
	ButtonInteraction,
} from "discord.js";

export interface IButton {
	readonly customId: string;
	executeInteraction(buttonInteraction: ButtonInteraction): void;
}