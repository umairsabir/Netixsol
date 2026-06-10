const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: [{ type: String }],
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
