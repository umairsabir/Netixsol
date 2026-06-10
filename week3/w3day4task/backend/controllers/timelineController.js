const Timeline = require('../models/Timeline');

exports.getByProject = async (req, res) => {
  try {
    const timeline = await Timeline.findOne({ project: req.params.projectId });
    res.json(timeline || null);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.upsert = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { steps } = req.body;
    const timeline = await Timeline.findOneAndUpdate(
      { project: projectId },
      { $set: { project: projectId, steps } },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(timeline);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStep = async (req, res) => {
  try {
    const { projectId, stepIndex } = req.params;
    const timeline = await Timeline.findOne({ project: projectId });
    if (!timeline) return res.status(404).json({ message: 'Timeline not found' });
    timeline.steps[stepIndex] = { ...timeline.steps[stepIndex].toObject(), ...req.body };
    await timeline.save();
    res.json(timeline);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
