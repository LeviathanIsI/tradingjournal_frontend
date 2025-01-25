// backend/utils/featuredReviews.js
const TradeReview = require("../models/TradeReview");
const moment = require("moment-timezone");

const updateFeaturedReviews = async () => {
  try {
    const now = moment().tz("America/New_York");
    const isWeekend = now.day() === 0 || now.day() === 6; // 0 is Sunday, 6 is Saturday
    const isMonday = now.day() === 1;

    // If it's weekend, keep current featured reviews
    if (isWeekend) {
      console.log("Weekend detected - keeping current featured reviews");
      return;
    }

    // Get yesterday's date range in EST
    const estYesterday = now.subtract(1, "day");
    const startOfDay = estYesterday.startOf("day").toDate();
    const endOfDay = estYesterday.endOf("day").toDate();

    // Find top liked reviews from yesterday
    const topLikedReviews = await TradeReview.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          isPublic: true,
        },
      },
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likes", []] } },
        },
      },
      {
        $match: {
          likesCount: { $gt: 0 }, // Only get reviews with likes
        },
      },
      {
        $sort: { likesCount: -1 },
      },
    ]);

    // If it's Monday and we have no new reviews, keep weekend reviews
    if (isMonday && topLikedReviews.length === 0) {
      console.log(
        "Monday with no new reviews - keeping weekend featured reviews"
      );
      return;
    }

    // Reset all current featured reviews
    await TradeReview.updateMany({}, { featured: false });

    let featuredReviews = [...topLikedReviews];

    // If we don't have 5 liked reviews, get random reviews to fill the gap
    if (topLikedReviews.length < 5) {
      const remaining = 5 - topLikedReviews.length;
      const randomReviews = await TradeReview.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            isPublic: true,
            _id: { $nin: topLikedReviews.map((r) => r._id) },
          },
        },
        { $sample: { size: remaining } },
      ]);

      featuredReviews = [...topLikedReviews, ...randomReviews];
    } else {
      // If we have more than 5, take only top 5
      featuredReviews = topLikedReviews.slice(0, 5);
    }

    // Update featured status for selected reviews
    if (featuredReviews.length > 0) {
      await TradeReview.updateMany(
        { _id: { $in: featuredReviews.map((review) => review._id) } },
        { featured: true }
      );
    }

    console.log(
      `Updated featured reviews: ${featuredReviews.length} reviews selected`
    );
    return featuredReviews;
  } catch (error) {
    console.error("Error updating featured reviews:", error);
    throw error;
  }
};

// Function to check if there are any featured reviews
const checkAndUpdateFeatured = async () => {
  const featuredCount = await TradeReview.countDocuments({ featured: true });
  if (featuredCount === 0) {
    // If no featured reviews exist, run the update
    await updateFeaturedReviews();
  }
};

module.exports = { updateFeaturedReviews, checkAndUpdateFeatured };
