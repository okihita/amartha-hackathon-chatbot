const express = require('express');
const router = express.Router();
const MajelisController = require('../controllers/MajelisController');

router.get('/', MajelisController.getAll.bind(MajelisController));
router.get('/:id', MajelisController.getById.bind(MajelisController));
router.post('/', MajelisController.create.bind(MajelisController));
router.put('/:id', MajelisController.update.bind(MajelisController));
router.delete('/:id', MajelisController.delete.bind(MajelisController));
router.post('/:id/members', MajelisController.addMember.bind(MajelisController));
router.delete('/:id/members/:phone', MajelisController.removeMember.bind(MajelisController));

// Attendance routes
router.post('/:id/attendance', MajelisController.recordAttendance.bind(MajelisController));
router.get('/:id/attendance', MajelisController.getAllAttendance.bind(MajelisController));
router.get('/:id/attendance/:attendanceId', MajelisController.getAttendance.bind(MajelisController));
router.put('/:id/attendance/:attendanceId', MajelisController.updateAttendance.bind(MajelisController));
router.delete('/:id/attendance/:attendanceId', MajelisController.deleteAttendance.bind(MajelisController));

module.exports = router;
