require("dotenv").config();

const MONGO_DB_URL = process.env.MONGO_URI;
const SALT = parseInt(process.env.SALT);
const SECRET_KEY = process.env.SECRET_KEY;
const PORT = process.env.PORT || 8000;

module.exports = {
    MONGO_DB_URL,
    SALT,
    SECRET_KEY,
    PORT,
}