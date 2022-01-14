export class PlayerModel {
	public position: number;
	public name: string;
	public score: number;
	public duration: string;

	constructor(position: number, name: string, score: number, duration: string) {
		this.position = position;
		this.name = name;
		this.score = score;
		this.duration = duration;
	}
}
