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


const asyncHandler = (requestHandler) => {
    async (req, res, next) => {
        try {
            await requestHandler(req, res, next)
        } catch (error) {
            res.status(err.code || 500).json({
                success: false,
                message: err.message
            })
        }
    }
}

export { asyncHandler }
