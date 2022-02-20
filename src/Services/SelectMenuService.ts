import { ISelectMenu } from "../Interfaces/ISelectMenu";
import { Collection } from "discord.js";
import fs from "fs/promises";
import { Config } from "../Config/Config";

export class SelectMenuService {
	private readonly pathSelectMenus: string = "Interactions/SelectMenus";
	private readonly selectMenuCollectionInstances: Collection<string, ISelectMenu>;

	constructor() {
		this.selectMenuCollectionInstances = new Collection<string, ISelectMenu>();
		(async () => {
			let files: string[] = await fs.readdir(Config.outDir + this.pathSelectMenus);
			files = files.map(f => f.slice(0, f.length - 3));
			for (const f of files) {
				const selectMenuImport = await import(`../${this.pathSelectMenus}/${f}`);
				const selectMenuClass = selectMenuImport[f];
				const selectMenuClassInstance: ISelectMenu = new selectMenuClass();
				this.selectMenuCollectionInstances.set(selectMenuClassInstance.customId, selectMenuClassInstance);
			}
		})();
	}

	/**
	 * Retourne l'instance du select selon son Id
	 * @param customId
	 */
	public getInstance(customId: string): ISelectMenu {
		return this.selectMenuCollectionInstances.get(customId);
	}
}
