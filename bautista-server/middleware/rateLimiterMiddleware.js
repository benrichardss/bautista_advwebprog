const rateLimit = require("express-rate-limit");

const loginAttempts = new Map();

const getLoginKey = (req) => {
    const email = String(req.body.email || "").toLowerCase().trim();

    return `${email}:${req.ip}`;
};

const getLockoutDuration = (failedAttempts) => {
    if (failedAttempts === 10) return 30 * 60 * 1000;
    if (failedAttempts === 8) return 5 * 60 * 1000;
    if (failedAttempts === 5) return 3 * 60 * 1000;

    return 0;
};

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: "Too many login requests. Please try again later."
        });
    },

    // Adaptive failed-login lockout
    skip: (req, res) => {
        const key = getLoginKey(req);
        const record = loginAttempts.get(key);

        if (record?.lockedUntil > Date.now()) {
            const retryAfter = Math.ceil(
                (record.lockedUntil - Date.now()) / 1000
            );

            res.set("Retry-After", String(retryAfter));

            res.status(429).json({
                success: false,
                message: "Too many failed login attempts. Try again later.",
                retryAfter
            });

            return true;
        }

        if (record?.lockedUntil && record.lockedUntil <= Date.now()) {
            record.lockedUntil = null;
        }

        res.on("finish", () => {
            if (res.statusCode === 401) {
                const currentRecord = loginAttempts.get(key) || {
                    failedAttempts: 0,
                    lockedUntil: null
                };

                currentRecord.failedAttempts += 1;

                const lockoutDuration = getLockoutDuration(
                    currentRecord.failedAttempts
                );

                if (lockoutDuration > 0) {
                    currentRecord.lockedUntil =
                        Date.now() + lockoutDuration;
                }

                loginAttempts.set(key, currentRecord);
            }

            if (res.statusCode === 200) {
                loginAttempts.delete(key);
            }
        });

        return false;
    }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many registration attempts. Please try again later."
    }
});

const passwordChangeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many password change attempts. Please try again later."
    }
});

const userApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

module.exports = {
    loginLimiter,
    registerLimiter,
    passwordChangeLimiter,
    userApiLimiter
};