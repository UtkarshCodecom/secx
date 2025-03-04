import { ApiResponse } from '../utils/ApiResponse.js';
import fs from 'fs';
import csv from 'csv-parser';
import { ApiError } from '../utils/ApiError.js';
import { Event } from '../models/event.model.js';
import { Course } from '../models/course.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const uploadCsv = asyncHandler(async (req, res) => {
  const file = req.file;
  try {
    if (!file) {
      return res.status(400).json(new ApiResponse(400, 'No file uploaded'));
    }

    const events = [];
    fs.createReadStream(file.path)
      .pipe(csv())
      .on('data', (row) => {
        events.push({
          title: row.title,
          description: row.description,
          venue: row.venue,
          totalSlots: Number(row.totalSlots),
          remainingSlots: Number(row.remainingSlots),
          thumbnailUrl:
            row.thumbnailUrl ||
            'https://www.hiphopshakespeare.com/wp-content/uploads/2013/11/dummy-image-landscape-1024x585.jpg',
          footerImageUrl:
            row.footerImageUrl ||
            'https://www.hiphopshakespeare.com/wp-content/uploads/2013/11/dummy-image-landscape-1024x585.jpg',
          eventDate: new Date(row.eventDate) || new Date(),
          eventTime: row.eventTime,
          isFree: row.isFree.toLowerCase() === 'true',
          price: Number(row.price),
        });
      })
      .on('end', async () => {
        await Event.insertMany(events);
        fs.unlinkSync(file.path); // Remove file after processing
        res.json(new ApiResponse(200, 'CSV imported successfully', events));
      });
  } catch (error) {
    res.status(500).json(new ApiError(500, 'Error processing CSV', error));
  }
});

// import course csv
export const uploadCoursesFromCSV = asyncHandler(async (req, res) => {
  const file = req.file;
  const filePath = file.path;
  const coursesMap = new Map();

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const {
          courseId,
          courseTitle,
          subtitle,
          duration,
          thumbnailUrl,
          category,
          description,
          certificateURL,
          isFree,
          price,
          sectionId,
          sectionTitle,
          lessonTitle,
          videoUrl,
          lessonThumbnailUrl,
          lessonDuration,
        } = row;

        // Ensure course exists in the map
        if (!coursesMap.has(courseId)) {
          coursesMap.set(courseId, {
            title: courseTitle,
            subtitle,
            duration,
            thumbnailUrl,
            category,
            description,
            certificateURL,
            isFree: isFree.toLowerCase() === 'true',
            price: Number(price),
            sections: [],
          });
        }

        const course = coursesMap.get(courseId);

        // Ensure section exists
        let section = course.sections.find((sec) => sec.title === sectionTitle);
        if (!section) {
          section = { title: sectionTitle, lessons: [] };
          course.sections.push(section);
        }

        // Add lesson
        section.lessons.push({
          title: lessonTitle,
          videoUrl,
          lessonThumbnailUrl,
          duration: lessonDuration,
        });
      })
      .on('end', async () => {
        try {
          const courseArray = Array.from(coursesMap.values());
          await Course.insertMany(courseArray);
          console.log('Courses imported successfully');

          fs.unlinkSync(filePath);
          return res.json(new ApiResponse(200, 'Courses imported successfully'));
        } catch (error) {
          console.error('Error inserting courses:', error);
          reject(error);
        }
      });
  });
});

// export const insertCsvData = asyncHandler(async (filePath) => {
//   try {
//     const events = [];

//     // Read and parse CSV
//     const stream = fs.createReadStream(filePath).pipe(csvParser());

//     for await (const row of stream) {
//       events.push({
//         title: row.title,
//         description: row.description,
//         venue: row.venue,
//         totalSlots: parseInt(row.totalSlots, 10),
//         remainingSlots: parseInt(row.remainingSlots, 10),
//         thumbnailUrl: row.thumbnailUrl || null,
//         footerImageUrl: row.footerImageUrl || null,
//         eventDate: new Date(row.eventDate),
//         eventTime: row.eventTime,
//         isFree: row.isFree.toLowerCase() === 'true',
//         price: parseFloat(row.price) || 0,
//       });
//     }

//     // Insert into MongoDB
//     await Event.insertMany(events);
//     console.log('CSV data successfully inserted!');
//   } catch (error) {
//     console.error('Error inserting CSV data:', error.message);
//   }
// });
