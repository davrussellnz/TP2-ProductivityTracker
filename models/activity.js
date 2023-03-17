//activity.js

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activity_type: { type: String, required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
});

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
