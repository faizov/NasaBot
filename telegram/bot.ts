import { Bot, CallbackQueryContext, Context } from "grammy";
import { config } from "dotenv";

import {
  apodCommand,
  initUser,
  randomApodCommand,
  randomMarsCommand,
  removeUser,
  startCommand,
} from "./comands";

config();

const token: string = process.env.BOT_TOKEN as string;

const bot = new Bot(token);

bot.on("my_chat_member", (ctx) => {
  const { chat } = ctx;
  const { status } = ctx.update.my_chat_member.new_chat_member;

  if (chat) {
    if (status === "member") {
      initUser(chat);
    } else if (status === "kicked" || status === "left") {
      removeUser(chat.id);
    }
  }
});

bot.command("start", startCommand);

bot.command("photo_day", apodCommand);

bot.command("random_apod", randomApodCommand);

bot.command("random_mars", randomMarsCommand);

bot.callbackQuery(
  "click-random-apod",
  async (ctx: CallbackQueryContext<Context>) => {
    await randomApodCommand(ctx);
  }
);

bot.callbackQuery(
  "click-random-mars",
  async (ctx: CallbackQueryContext<Context>) => {
    await ctx.answerCallbackQuery({
      text: "Let's find a nice photo!",
    });
    await randomMarsCommand(ctx);
  }
);

bot.start();
