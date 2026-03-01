export const validateEmail = (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    next();
};