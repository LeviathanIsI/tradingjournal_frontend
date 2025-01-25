// backend/utils/scheduler.js
const cron = require("node-cron");
const {
  updateFeaturedReviews,
  checkAndUpdateFeatured,
} = require("./featuredReviews");

const scheduleFeaturedReviewsUpdate = () => {
  // Run at 6am EST every day
  cron.schedule(
    "0 6 * * *",
    async () => {
      console.log("Running featured reviews update...");
      try {
        await updateFeaturedReviews();
      } catch (error) {
        console.error("Failed to update featured reviews:", error);
      }
    },
    {
      scheduled: true,
      timezone: "America/New_York",
    }
  );

  // Add a check every hour to ensure we have featured reviews
  cron.schedule(
    "0 * * * *",
    async () => {
      try {
        await checkAndUpdateFeatured();
      } catch (error) {
        console.error("Failed to check featured reviews:", error);
      }
    },
    {
      scheduled: true,
      timezone: "America/New_York",
    }
  );
};

module.exports = { scheduleFeaturedReviewsUpdate };
