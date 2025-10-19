// models/Post.js
const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        text: { type: String, required: true, trim: true, maxlength: 2000 },
    },
    { timestamps: true }
);

const commentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        text: { type: String, required: true, trim: true, maxlength: 2000 },
        replies: [replySchema],
    },
    { timestamps: true }
);

const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 200 },
        content: { type: String, required: true, trim: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        comments: [commentSchema],
    },
    { timestamps: true }
);

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
module.exports = Post;
