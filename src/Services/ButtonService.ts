import { IButton } from "../Interfaces/IButton";
import { Collection } from "discord.js";
import * as fs from "fs/promises";
import { Config } from "../Config/Config";

export class ButtonService {
	private readonly _pathButtons: string = "Interactions/Buttons";
	private readonly _buttonsInstanceCollection: Collection<string, IButton>;

	/**
	 * Récupère les fichiers Button, créé les instances des classes et les insèrent dans la collection
	 */
	constructor() {
		this._buttonsInstanceCollection = new Collection<string, IButton>();
		(async () => {
			let files: string[] = await fs.readdir(Config.outDir + this._pathButtons);
			files = files.map(f => f.slice(0, f.length - 3));
			for (const f of files) {
				const btnImport = await import(`../${this._pathButtons}/${f}`);
				const btnClass = btnImport[f];
				const btnClassInstance: IButton = new btnClass();
				this._buttonsInstanceCollection.set(btnClassInstance.customId, btnClassInstance);
			}
		})();
	}

	/**
	 * Retourne l'instance du bouton selon son Id
	 * @param customId
	 */
	public getInstance(customId: string): IButton {
		return this._buttonsInstanceCollection.get(customId);
	}
}
