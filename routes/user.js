import { Router } from "express"
import { User } from "../models/user.js";

const router = Router();

router.get("/signin", (req, res) => {
  return res.render("signin");
})

router.get("/signup", (req, res) => {
  return res.render("signup");
})

router.get("/logout", (req, res) => {
  return res.clearCookie('token').redirect("/");
})

router.post("/signin", async(req, res) => {

  const { email, password } = req.body;

  try {

    const token = await User.matchPasswordAndGenerateToken(email, password);
    return res.cookie('token', token).redirect("/");

  } catch (error) {

    return res.render("signin", {
      error: "Invalid email or password"
    })

  }
})

router.post("/signup", async(req, res) => {
  const { fullName, email, password } = req.body;
  await User.create({
    fullName,
    email,
    password
  });

  return res.redirect("/");
})

export default router;