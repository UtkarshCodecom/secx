export const getS3KeyFromUrl = (url) => {
  if (!url) return null;
  try {
    // Extract the file path from the URL
    const urlParts = new URL(url);
    // Remove the leading slash if exists
    return urlParts.pathname.substring(1);
  } catch (error) {
    // If URL parsing fails, try to get filename directly
    return url.split('/').pop();
  }
};
