import { FieldValue } from "firebase-admin/firestore";
import { statsDb } from "../firebase";

export const addUserToDailyUsage = async (userId: number) => {
  const statsCollectionRef = statsDb;
  const today = new Date();
  const todayDateString = today.toISOString().split("T")[0];

  const todayStatsDocRef = statsCollectionRef.doc(todayDateString);

  const update = {
    usersToday: FieldValue.arrayUnion(userId),
  };

  await todayStatsDocRef.update(update);
};
