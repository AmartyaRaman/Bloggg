import { Schema, model } from "mongoose";
import { createHmac, randomBytes} from "crypto"
import { createTokenForUser } from "../services/authentication.js";

const userSchema = new Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String
  },
  profileImageUrl: {
    type: String,
    default: "/images/default-avatar.png"
  },
  role: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: "USER"
  }

}, { timestamps: true });

userSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  const salt = randomBytes(16).toString();
  const hashedPassword = createHmac("sha256", salt).update(user.password).digest("hex");
  
  this.salt = salt;
  this.password = hashedPassword;

  next();
})

userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {
  const user = await this.findOne({ email }); 

  if (!user) throw new Error("User Not found");

  const salt = user.salt;
  const hashedPassword = user.password;

  const userProvidedHash = createHmac("sha256", salt).update(password).digest("hex");
  if (hashedPassword !== userProvidedHash) throw new Error("User Not found");

  const token = createTokenForUser(user);
  return token;
})

export const User = model("user", userSchema);