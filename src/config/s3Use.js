// Import the module for utilizing AWS S3 functions
import {
  awsFolderNames,
  uploadFileToAws,
  deleteFileFromAws,
} from '../services/awsS3connect.js';
import { ApiError } from '../utils/ApiError.js';

// Function to upload a file to AWS S3 bucket
export const uploadFileToAwsS3 = async (dataObject) => {
  try {
    // Ensure the `fileName` and `filePath` are properly defined in `dataObject`
    const { fileName, filePath , folderName, isVideo} = dataObject;
    if (!fileName || !filePath) {
      throw new ApiError(500, 'Missing fileName or filePath in dataObject');
    }

    // Upload the file to AWS S3 bucket in the specified subfolder
    const folderPath = `${folderName}/${fileName}`;

    const result = await uploadFileToAws(folderPath, filePath, isVideo);
    console.log('File successfully uploaded to AWS S3:', folderPath);
    
    return {
      url: result.Location, // The public URL of uploaded file
      bucket: result.Bucket,
      key: result.Key,
      etag: result.ETag,
      success: true
    };
  } catch (error) {
    throw new ApiError(500, `Failed to upload file to AWS S3: ${error}`);
  }
};

// Function to delete a file from AWS S3 bucket
export const deleteFileFromAwsS3 = async function (dataObject) {
  try {
    const { fileName } = dataObject;
    if (!fileName) {
      throw new Error('Missing fileName in dataObject');
    }

    // Delete the specified file from AWS S3 bucket
    await deleteFileFromAws(`${fileName}`);
  } catch (error) {
    console.error('Error deleting file from AWS S3:', error);
    throw error;
  }
};