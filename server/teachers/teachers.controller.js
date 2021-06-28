const express = require('express');
const router = express.Router();
const teacherService = require('./teacher.service');

// routes
router.get('/', teacherService.getTeachers);
router.get('/tipoAsignaturas', teacherService.getTypeAsig);
router.get('/modalidad', teacherService.getTypeMod);
router.get('/nivel', teacherService.getNivel);
router.get('/:id', teacherService.getUserTeacherById);
router.get('/teachCal/:id', teacherService.getDataCalendar);
router.get('/teachFiles/:userName', teacherService.getFilesTeacher);
router.get('/teachCalTime/:id/:nameAsig/:nameNivel', teacherService.getTimeAsigCalendar);
router.get('/teachAsig/:id', teacherService.getAsigByTeacher);
router.get('/teachMod/:id', teacherService.getModByTeacher);
router.get('/teachNotifCont/:id', teacherService.getNotifContByTeacher);
router.get('/teachNotifContMensj/:id/:notified', teacherService.getNotifContMensjByTeacher);
router.get('/user/:id', teacherService.getTeacherByUserId);
router.post('/register', teacherService.createTeacher);
router.post('/registerAsignatura', teacherService.createAsig);
router.post('/registerModalidad', teacherService.createMod);
router.post('/addDataCalendar', teacherService.addDataCalendar);
router.post('/authenticate', teacherService.authenticateTeacher);
router.post('/verification', teacherService.verifyTeacher);
router.post('/update/:id', teacherService.updateTeacher);
router.post('/updateNotifCont', teacherService.updateNotifMensjCont);
router.post('/uploadFileStatus', teacherService.uploadGetFileStatus);
router.post('/uploadFileUpload', teacherService.uploadTeacherFileUpload);
router.post('/teachModifyFiles', teacherService.modifyTeacherFiles);
router.delete('/:id', teacherService.deleteTeacher);
router.delete('/asig/:id', teacherService.deleteAsigTeacher);
router.delete('/mod/:id', teacherService.deleteModTeacher);
router.delete('/teachDeleteFiles/:obj/:userName', teacherService.deleteTeacherFiles);

module.exports = router;