import { FieldValue } from "firebase-admin/firestore";
import { statsDb } from "./firebase";

export const addUserToDailyUsage = async () => {
  const statsCollectionRef = statsDb.doc("day-stats");
  const today = new Date();
  const todayDateString = today.toISOString().split("T")[0];

  await statsCollectionRef.set(
    {
      [todayDateString]: FieldValue.increment(1),
    },
    { merge: true }
  );
};

export const getUserToDailyUsage = async () => {
  const statsCollectionRef = statsDb.doc("day-stats");
  const today = new Date();
  const todayDateString = today.toISOString().split("T")[0];
  const doc = await statsCollectionRef.get();

  if (doc.exists) {
    const data = doc.data();
    const usersCountToday = data && data[todayDateString];
    return usersCountToday;
  }
};
