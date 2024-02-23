// Creating a utility file for handling the API error

// Defining a class called ApiError which extends the built-in Error class
class ApiError extends Error {
    // Constructor function for the ApiError class, takes statusCode, message, errors, and stack as parameters
    constructor(
        statusCode,        // Status code of the API error
        message = "Something went wrong",  // Default error message if not provided
        errors = [],       // Array of errors
        stack = ""         // Stack trace information
    ) {
        // Calling the constructor of the parent class (Error)
        super(message);
        
        // Setting properties of the ApiError instance
        this.statusCode = statusCode;  // Assigning the provided statusCode
        this.data = null;               // Placeholder for additional data (not used here)
        this.message = message;         // Assigning the provided message
        this.success = false;           // Indicating that the operation wasn't successful
        this.errors = errors;           // Assigning the provided errors array

        // If stack trace information is provided, assign it to the stack property
        if (stack) {
            this.stack = stack;
        } else {
            // Otherwise, capture the stack trace using Error.captureStackTrace() method
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Exporting the ApiError class for use in other parts of the application
export { ApiError };
