const express = require('express');
const router = express.Router();
const ApplicationController = require('../../controllers/admin/applicationsController');
const { isAdmin } = require('../../middleware/auth');

router.use(isAdmin);

router.get('/pending', ApplicationController.getPending);
router.post('/:id/approve', ApplicationController.approve);
router.post('/:id/reject', ApplicationController.reject);
router.get('/timeline', ApplicationController.getTimeline);

module.exports = router;
