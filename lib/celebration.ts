import { TOTAL_DAYS } from "./program";

export interface CelebrationMessage {
  title: string;
  body: string;
  isMilestone: boolean;
}

export function getCelebrationMessage(dayNumber: number): CelebrationMessage {
  if (dayNumber === TOTAL_DAYS) {
    return {
      title: "You've completed the 21-Day Growth Journey! 🏆",
      body: "Spiritual growth is lifelong and progressive. Keep walking with your Father.",
      isMilestone: true,
    };
  }

  if (dayNumber % 7 === 0) {
    const week = dayNumber / 7;
    return {
      title: `You've completed Week ${week}! 🌟`,
      body: "Look how far you've come. Stay consistent and keep growing.",
      isMilestone: true,
    };
  }

  return {
    title: `🎉 Day ${dayNumber} complete!`,
    body: "You're growing. See you tomorrow for the next step.",
    isMilestone: false,
  };
}
