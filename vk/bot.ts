import { VK } from "vk-io";
import { config } from "dotenv";
import schedule from "node-schedule";

import { fetchRandomMars } from "../data/mars";

config();

const vk = new VK({
  token: process.env.VK_TOKEN || "",
});

schedule.scheduleJob("0 * * * *", async () => {
  const marsPhoto = await fetchRandomMars();
  console.log("marsPhoto", marsPhoto);

  if (marsPhoto) {
    const photo = await vk.upload.wallPhoto({
      source: {
        value: marsPhoto.img_src,
      },
    });

    try {
      vk.api.wall
        .post({
          owner_id: -Number(process.env.GROUP_ID),
          message: `Earth date: ${marsPhoto.earth_date}\nSol: ${marsPhoto.sol}`,
          attachments: `photo${photo.ownerId}_${photo.id}`,
        })
        .then((response) => {
          console.log("Запись успешно опубликована:", response);
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.log("error", error);
    }
  }
});
