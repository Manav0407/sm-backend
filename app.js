import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

if (process.env.NODE_ENV !== "Production")
  dotenv.config({ path: "E:/MERN/socialMedia/backend/config/config.env" });

//using Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin:"http://localhost:3000",
  methods:["GET","POST","PUT","DELETE"],
  credentials:true,
}));
// app.use(cors({
// origin:"https://sm-frontend-awez.vercel.app",
// credentials:true,
// }))
// app.use(cors());
// app.options('*', cors())

// app.use(function (req, res, next) {
//   //Enabling CORS
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization")
//     next();
// });


app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));

//importing routes
import user from "./routes/user.js";
import post from "./routes/post.js";
import story from "./routes/story.js";

//using Routes
app.use("/api/v1", user);
app.use("/api/v1", post);
app.use("/api/v1", story);

app.get("/", (req, res) => {
  res.send("working...");
});

export default app;
