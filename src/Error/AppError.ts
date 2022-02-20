export class AppError extends Error {
	public constructor(name: string, message: string) {
		super();
		Error.captureStackTrace(this, this.constructor);
		this.name = name;
		this.message = message;
	}
}
