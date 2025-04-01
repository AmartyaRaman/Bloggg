import express from 'express'
import path from 'path'
import userRouter from './routes/user.js';
import blogRouter from './routes/blog.js';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { checkForAuthenticationCookie } from './middlewares/authentication.js';
import { Blog } from './models/blog.js';

const app = express();
const PORT = 8000;
mongoose.connect("mongodb://127.0.0.1:27017/bloggg").then((e) => console.log("MongoDB Connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.resolve("./public")))

app.use(checkForAuthenticationCookie('token'))

app.use("/user", userRouter);
app.use("/blog", blogRouter);

app.get("/", async(req, res) => {
  const allBlogs = await Blog.find({}).sort("createdAt")
  res.render("homepage", {
    user: req.user,
    blogs: allBlogs
  });
})

app.listen(PORT, () => console.log("Server is listening at PORT:", PORT));