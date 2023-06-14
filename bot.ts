import { Bot, CallbackQueryContext, Context } from "grammy";
import { run } from "@grammyjs/runner";
import { config } from "dotenv";

import {
  apodCommand,
  initUser,
  photoDayStart,
  photoDayStop,
  randomApodCommand,
  dateApodCommand,
  randomMarsCommand,
  removeUser,
  startCommand,
} from "./src/comands";
import { cronApod, cronMars } from "./src/cron/cron";
import { addUserToDailyUsage } from "./src/service/statsUser";

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

function handler() {
  return (ctx: any, next: () => void) => {
    if (ctx.from?.id !== parseInt(process.env.ID_ADMIN!)) {
      addUserToDailyUsage();
    }
    next();
  };
}

bot.command("start", startCommand);

bot.command("photo_day", handler(), (ctx) => {
  apodCommand(ctx);
});

bot.command("random_apod", handler(), (ctx) => {
  randomApodCommand(ctx);
});

bot.command("date_apod", handler(), dateApodCommand);

bot.command("random_mars", handler(), (ctx) => {
  randomMarsCommand(ctx);
});

bot.command("photo_day_start", photoDayStart);

bot.command("photo_day_stop", photoDayStop);

bot.callbackQuery(
  "click-random-apod",
  handler(),
  async (ctx: CallbackQueryContext<Context>) => {
    await randomApodCommand(ctx);
  }
);

bot.callbackQuery(
  "click-random-mars",
  handler(),
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

run(bot);
