import { Bot, CallbackQueryContext, Context } from "grammy";
import { run } from "@grammyjs/runner";
import { config } from "dotenv";

import {
  apodCommand,
  initUser,
  photoDayStart,
  photoDayStop,
  randomApodCommand,
  randomMarsCommand,
  removeUser,
  startCommand,
} from "./comands";
import { cronApod, cronMars } from "./cron";

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

// bot.on("message", (ctx) => {
//   console.log("ctx", ctx.chat.id);
// });

bot.command("start", startCommand);

bot.command("photo_day", apodCommand);

bot.command("random_apod", randomApodCommand);

bot.command("random_mars", randomMarsCommand);

bot.command("photo_day_start", photoDayStart);

bot.command("photo_day_stop", photoDayStop);

bot.callbackQuery(
  "click-random-apod",
  async (ctx: CallbackQueryContext<Context>) => {
    await randomApodCommand(ctx);
  }
);

bot.callbackQuery(
  "click-random-mars",
  async (ctx: CallbackQueryContext<Context>) => {
    try {
      await ctx.answerCallbackQuery({
        text: "Let's find a nice photo!",
      });
      await randomMarsCommand(ctx);
    } catch (error) {
      await ctx.answerCallbackQuery({
        text: `Error!`,
      });
      console.log("error", error);
    }
  }
);

cronApod(bot.api);
// cronMars(bot.api)

// bot.start();
run(bot);
