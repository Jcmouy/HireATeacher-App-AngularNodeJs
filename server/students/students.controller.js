const express = require('express');
const router = express.Router();
const studentService = require('./student.service');

// routes
router.get('/', studentService.getStudents);
router.get('/:id', studentService.getStudentById);
router.get('/locateAsig/:nameAsig', studentService.getlocationAsig);
router.get('/getNotificationHire/:mobileEstudiante', studentService.getNotificationHire);
router.get('/getNotificationVal/:mobileEstudiante', studentService.getNotificationVal);
router.post('/send_sms', studentService.sendStudentSMS);
router.post('/verify_otp', studentService.verifyOtp);
router.post('/set_location', studentService.updateLocation);
router.post('/changeNotifState', studentService.updateStudentNotifMensjCont);
router.post('/startCallCheckout', studentService.startCallCheckout);
router.post('/setHireNotification', studentService.setHireNotification);
router.post('/setNotificationVal', studentService.setNotificationVal);
router.post('/setFilterCosto', studentService.setFilterCosto);
router.post('/setFilterHorario', studentService.setFilterHorario);
router.post('/setFeedbackTeacher', studentService.setFeedbackTeacher);
router.post('/setHire', studentService.setHire);
router.put('/:id', studentService.updateStudent);
router.delete('/:id', studentService.deleteStudent);

module.exports = router;