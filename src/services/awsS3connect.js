import {
  S3Client,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import fs from 'fs';
import config from '../config/config.js';
import { Upload } from '@aws-sdk/lib-storage';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { ApiError } from '../utils/ApiError.js';

// Destructure AWS credentials
const {
  secretAccessKey: AWS_SECRETACCESSKEY,
  accessKeyId: AWS_ACCESSKEYID,
  region: AWS_REGION,
  bucketName: AWS_BUCKET_NAME,
} = config.awsConfig;

// Initialize an S3 client with provided credentials
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESSKEYID,
    secretAccessKey: AWS_SECRETACCESSKEY,
  },
  requestHandler: new NodeHttpHandler({
    socketTimeout: 300000, // 5 minutes
    connectionTimeout: 300000, // 5 minutes
  }),
  maxAttempts: 3, // Retry failed uploads
  forcePathStyle: true, // Better compatibility with some S3 regions
});

// Define folder names for easier reference
export const awsFolderNames = {
  profile_image: 'user_profile_image',
  thumbnail: 'thumbnail',
  video: 'video',
  certificate: 'certificate',
  // course_thumbnail: 'course_thumbnail',
  // course_video: 'course_videos',
  // course_certificate: 'course_certificate',
  // pathway_thumbnail: 'pathway_thumbnail',
  // pathway_video: 'pathway_videos',
  // quiz_thumbnail: 'quiz_thumbnail',
  // event_thumbnail: 'event_thumbnail',
  // podcast_thumbnail: 'podcast_thumbnail',
};

export const uploadFileToAws = async (fileName, filePath, isVideo = false) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new ApiError(500, `File does not exist at path: ${filePath}`);
    }

    const fileStream = fs.createReadStream(filePath);

    // Adjust chunk size based on file type
    const chunkSize = isVideo ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for videos, 5MB for others

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: fileStream,
      },
      partSize: chunkSize,
      queueSize: isVideo ? 8 : 4, // Increased concurrent uploads for videos
    });

    // Optional: Track upload progress
    upload.on('httpUploadProgress', (progress) => {
      const percentage = Math.round((progress.loaded / progress.total) * 100);
      console.log(`Upload progress: ${percentage}%`);
    });

    const result = await upload.done();

    // Clean up local file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file: ${err}`);
      }
    });

    return result;
  } catch (err) {
    throw new ApiError(500, `Error uploading to AWS S3: ${err}`);
  }
};

// Function to delete a file from AWS S3
export const deleteFileFromAws = async (fileName) => {
  try {
    // Configure the parameters for the S3 delete operation
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME, // Ensure this is correctly set in your environment
      Key: fileName,
    };

    // Send the DeleteObjectCommand to S3
    const data = await s3Client.send(new DeleteObjectCommand(deleteParams));

    console.log('File successfully deleted from AWS S3:', fileName);
    return data; // Optional: Return response data if needed
  } catch (err) {
    console.error('Error deleting file from AWS S3:', err);
    throw new ApiError(500, `Error deleting file from AWS S3: ${err.message}`);
  }
};
export { s3Client };
