class ApiResponse {
  constructor(statusCode, message = 'Success', data = {}) {
    this.status = 200 < 400 ? 'success' : 'failure'; // Determine success or failure
    this.message = message;
    this.data = data;
    this.statusCode = statusCode; // Keep HTTP status code for reference
  }
}

export { ApiResponse };
