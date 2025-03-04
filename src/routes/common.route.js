import express from 'express';

import csvUpload from '../middlewares/csvupload.js';
import { uploadCoursesFromCSV, uploadCsv } from '../controllers/commonController.js';

const router = express.Router();

router.post('/upload-csv/event', csvUpload.single('file'), uploadCsv);
router.post('/upload-csv/course', csvUpload.single('file'), uploadCoursesFromCSV);


export default router;