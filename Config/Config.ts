import * as dotenv from 'dotenv';
dotenv.config();
import { ICommand } from '../Commands/ICommand';
import { AddRoleCommand } from '../Commands/moderation/AddRole';
import { ClearCommand } from '../Commands/moderation/Clear';
import { RemoveRoleCommand } from '../Commands/moderation/RemoveRole';
import { SayCommand } from '../Commands/moderation/Say';
import { SayPrivCommand } from '../Commands/moderation/SayPriv';
import { SaySimpleCommand } from '../Commands/moderation/SaySimple';
import { SurveyCommand } from '../Commands/moderation/Survey';
import { HelpCommand } from '../Commands/utility/Help';
import { RestartCommand } from '../Commands/utility/Restart';
import { TopServerCommand } from '../Commands/utility/TopServer';

export class Config {

    public static readonly color = process.env.COLOR;
    public static readonly guildId = process.env.GUILD_ID;
    public static readonly surveyChannelId = process.env.CHA_SURVEY;
    public static readonly token = process.env.TOKEN;
    public static readonly voteKeeperId = process.env.WH_VK_ID;
    public static readonly serverKeeperId = process.env.WH_SK_ID;
    public static readonly serverKeeperToken = process.env.WH_SK_TOKEN;
    public static readonly commands = [ SayCommand, SaySimpleCommand, SurveyCommand, SayPrivCommand, AddRoleCommand, RemoveRoleCommand, ClearCommand, HelpCommand, RestartCommand, TopServerCommand ];

    constructor() { }

    public static getCommandsInstances(): ICommand[] {
        const commandsInstances = Config.commands.map(commandClass => new commandClass());
        return commandsInstances;
    }
}