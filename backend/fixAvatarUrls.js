const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path if needed
require('dotenv').config(); // Load MongoDB URI from .env

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    const result = await User.updateMany(
      { avatar: { $regex: '^http://stackit-backend-6nrt.onrender.com' } },
      [
        {
          $set: {
            avatar: {
              $replaceOne: {
                input: '$avatar',
                find: 'http://',
                replacement: 'https://',
              },
            },
          },
        },
      ]
    );

    console.log(`✅ Updated ${result.modifiedCount} user(s)`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error updating avatars:", err);
    process.exit(1);
  }
})();
