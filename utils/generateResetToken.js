import jwt from "jsonwebtoken";


export const generateResetToken = (userId) => {

    const token = jwt.sign({ id: userId }, process.env.RESET_PASSWORD_TOKEN, { expiresIn: "15m" })
    return token
}