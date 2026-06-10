const router = require('express').Router();
const auth = require('../middleware/auth');
const { getByProject, upsert, updateStep } = require('../controllers/timelineController');

router.get('/:projectId', auth, getByProject);
router.post('/:projectId', auth, upsert);
router.patch('/:projectId/step/:stepIndex', auth, updateStep);

module.exports = router;
