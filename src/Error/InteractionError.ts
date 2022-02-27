export class InteractionError extends Error {
	public discordMessage: string;

	public constructor(discordMessage: string, name: string, message: string) {
		super();
		Error.captureStackTrace(this, this.constructor);
		this.name = name;
		this.discordMessage = discordMessage;
		this.message = message;
	}
}
