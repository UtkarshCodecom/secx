import mongoose from 'mongoose';

const streakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    streakCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dates: [
      {
        type: String,
        required: true,
      },
    ],
    lastUpdated: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Add index on dates array for better query performance
streakSchema.index({ dates: 1 });

// Helper method to get formatted date string
streakSchema.methods.getFormattedDate = function (date) {
  return date.toISOString().split('T')[0];
};

// Check if user has logged on a specific date
streakSchema.methods.hasLoggedOn = function (date) {
  const formattedDate = this.getFormattedDate(new Date(date));
  return this.dates.includes(formattedDate);
};

// Update streak for today
streakSchema.methods.updateDailyStreak = async function () {
  const today = new Date();
  const formattedToday = this.getFormattedDate(today);

  // If already logged today, just return current streak
  if (this.hasLoggedOn(formattedToday)) {
    const currentStreak = await this.calculateCurrentStreak();
    return {
      streakCount: this.streakCount,
      currentStreak,
      updated: false,
    };
  }

  // Check if yesterday's date exists in the streak
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const formattedYesterday = this.getFormattedDate(yesterday);

  const hasYesterdayStreak = this.hasLoggedOn(formattedYesterday);

  // Update streak count
  this.streakCount = hasYesterdayStreak ? this.streakCount + 1 : 1;

  // Add today's date (ensure no duplicates)
  if (!this.dates.includes(formattedToday)) {
    this.dates.push(formattedToday);
  }

  this.lastUpdated = today;

  await this.save();

  const currentStreak = await this.calculateCurrentStreak();

  return {
    streakCount: this.streakCount,
    currentStreak,
    lastUpdated: this.lastUpdated,
    updated: true,
  };
};

// Calculate current active streak
// streakSchema.methods.calculateCurrentStreak = async function () {
//   const sortedDates = this.dates
//     .map((date) => new Date(date))
//     .sort((a, b) => b - a)
//     .map((date) => this.getFormattedDate(date));

//   if (sortedDates.length === 0) return 0;

//   const today = this.getFormattedDate(new Date());
//   const yesterday = this.getFormattedDate(new Date(Date.now() - 86400000));

//   // Check if the most recent date is either today or yesterday
//   if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
//     return 0;
//   }

//   let currentStreak = 1;

//   for (let i = 0; i < sortedDates.length; i++) {
//     const currentDate = new Date(sortedDates[i]);
//     const prevDate = new Date(sortedDates[i + 1]);
//     const diffDays = Math.round(
//       (currentDate - prevDate) / (1000 * 60 * 60 * 24)
//     );

//     if (diffDays === 1) {
//       currentStreak++;
//     } else {
//       break;
//     }
//   }

//   return currentStreak;
// };

streakSchema.methods.calculateCurrentStreak = async function () {
  // Ensure dates are unique and sorted in descending order
  const uniqueDates = [...new Set(this.dates)]
    .map((date) => new Date(date)) // Convert to Date objects
    .sort((a, b) => b - a); // Sort descending

  if (uniqueDates.length === 0) return 0;

  const today = this.getFormattedDate(new Date());
  const yesterday = this.getFormattedDate(new Date(Date.now() - 86400000));

  // If the most recent date is not today or yesterday, streak ends
  if (
    this.getFormattedDate(uniqueDates[0]) !== today &&
    this.getFormattedDate(uniqueDates[0]) !== yesterday
  ) {
    return 0;
  }

  let currentStreak = 1;

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentDate = uniqueDates[i];
    const prevDate = uniqueDates[i + 1];

    // Calculate the difference in days
    const diffDays = (currentDate - prevDate) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentStreak++;
    } else {
      break; // Streak ends if gap is more than 1 day
    }
  }

  return currentStreak;
};

export const Streak = mongoose.model('Streak', streakSchema);
