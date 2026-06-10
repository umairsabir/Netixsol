const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  steps: [{
    label: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Timeline', timelineSchema);
