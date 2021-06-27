import { Message } from 'discord.js';
import * as dotenv from 'dotenv';
import { Bot } from './Bot';
import { CommandHandler } from './CommandHandler';

dotenv.config();

const bot: Bot = new Bot();
bot.start();

const commandHandler = new CommandHandler(process.env.PREFIX);

bot.client.on("message", (message: Message) => commandHandler.handleMessage(message, bot.client));