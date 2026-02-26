import adminModel from "../../models/adminModel.js";
import generateToken from "../../utils/generateToken.js";



const login = async (req, res) => {
    const { email, password } = req.body;
    const admin = await adminModel.findOne({ email });
    if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
    }

    let comparePassword = async (password) => {
        if (password === admin.password) {
            return true;
        }
        return false;
    };

    const isPasswordValid = await comparePassword(password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
    }
    const token = generateToken(res, admin._id);
    res.json({ message: "Login", admin, token });
};

const register = async (req, res) => {
    const { name, email, password } = req.body;
    const admin = await adminModel.create({ name, email, password, role: "admin", isVerified: true });
    res.json({ message: "Register", admin });
};

export { login, register };