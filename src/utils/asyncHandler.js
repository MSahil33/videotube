// Creating a utility function for handling the async request 

// 1. With the promises

// const asyncHandler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
//     }
// }


// export { asyncHandler }


// ______________Or___________


// 2. With the try catch

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}


// Defining a function called asyncHandler that takes a requestHandler function as input
const asyncHandler = (requestHandler) => {
    // Returning an async function that takes req, res, and next as parameters
    return async (req, res, next) => {
        try {
            // Waiting for the requestHandler function to complete asynchronously
            await requestHandler(req, res, next)
        } catch (err) {
            // If an error occurs, sending an error response back to the client
            res.status(err.code || 500).json({
                success: false,
                message: err.message
            })
        }
    }
}

// Exporting the asyncHandler function for use in other parts of the application
export { asyncHandler }

