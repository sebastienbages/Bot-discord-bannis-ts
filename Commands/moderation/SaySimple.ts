import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";

export class SaySimpleCommand implements ICommand {

    public readonly name = "saysimple";
    public readonly aliases = [];
    public readonly argumentIsNecessary = true;
    public readonly description = "Envoi un message avec le bot dans le salon utilisé";
    public readonly usage = "<text>";
    public readonly guildOnly = true;
    public readonly cooldown = 0;
    public readonly permission = 'MANAGE_MESSAGES';

    async run(commandContext: CommandContext): Promise<void> {
        try {
            const messageToSend = commandContext.args.join(' ');
            commandContext.message.channel.send(messageToSend);
        } 
        catch (error) {
            throw error;
        }
    }
}