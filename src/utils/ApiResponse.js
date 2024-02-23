// Creating a utility file for handling the response 

// Defining a class called ApiResponse
class ApiResponse {
    // Constructor function for the ApiResponse class, takes statusCode, data, and message as parameters
    constructor(statusCode, data, message = "Success") {
        // Setting properties of the ApiResponse instance
        this.statusCode = statusCode;  // Assigning the provided statusCode
        this.data = data;               // Assigning the provided data
        this.message = message;         // Assigning the provided message
        // Determining the success status based on statusCode (statusCode < 400 indicates success)
        this.success = statusCode < 400;
    }
}

// Exporting the ApiResponse class for use in other parts of the application
export { ApiResponse };
