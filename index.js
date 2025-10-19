const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const port = 4000;
const app = express();

dotenv.config();

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:4000'],
};

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors(corsOptions));

//MongoDB database
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));

const userRoutes = require("./router/userRoutes");
const commentRoutes = require("./router/commentRoutes");
const postRoutes = require("./router/postRoutes");

app.use("/users", userRoutes);
app.use("/posts", postRoutes)
app.use("/comments", commentRoutes)


app.get("/health", (req, res) => {
    const dbState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const states = ["disconnected", "connected", "connecting", "disconnecting"];

    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date(),
        database: states[dbState],
    });
});



if(require.main === module){
    app.listen(process.env.PORT || port, () => {
        console.log(`S87 API is now online on port ${ process.env.PORT || port }`)
    });
}

module.exports = {app,mongoose};