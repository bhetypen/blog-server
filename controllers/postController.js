// controllers/postController.js
const Post = require("../models/Post");
const { errorHandler } = require("../auth");

// Create post (auth: user)
async function createPost(req, res) {
    try {
        const { title, content } = req.body || {};
        if (!title || !content) return res.status(400).json({ error: "Title and content are required" });
        if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

        const post = await Post.create({
            title: String(title).trim(),
            content: String(content).trim(),
            author: req.user.id,
        });

        return res.status(201).json({
            message: "Post created",
            post: {
                id: post._id,
                title: post.title,
                content: post.content,
                author: req.user.id,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
            },
        });
    } catch (err) {
        console.error("createPost error:", err);
        return errorHandler(err, req, res);
    }
}

// Get all posts (public) with author username
async function getAllPosts(req, res) {
    try {
        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .populate("author", "username email")
            .lean();

        return res.json({
            posts: posts.map((p) => ({
                id: p._id,
                title: p.title,
                content: p.content,
                author: p.author ? { id: p.author._id, username: p.author.username, email: p.author.email } : null,
                commentsCount: Array.isArray(p.comments) ? p.comments.length : 0,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
            })),
        });
    } catch (err) {
        console.error("getAllPosts error:", err);
        return errorHandler(err, req, res);
    }
}

// Get single post (public) with populated author + comment/reply users
async function getPostById(req, res) {
    try {
        const { id } = req.params;
        const post = await Post.findById(id)
            .populate("author", "username email")
            .populate("comments.user", "username email")
            .populate("comments.replies.user", "username email")
            .lean();

        if (!post) return res.status(404).json({ error: "Post not found" });

        return res.json({
            post: {
                id: post._id,
                title: post.title,
                content: post.content,
                author: post.author ? { id: post.author._id, username: post.author.username, email: post.author.email } : null,
                comments: (post.comments || []).map((c) => ({
                    id: c._id,
                    text: c.text,
                    user: c.user ? { id: c.user._id, username: c.user.username, email: c.user.email } : null,
                    createdAt: c.createdAt,
                    updatedAt: c.updatedAt,
                    replies: (c.replies || []).map((r) => ({
                        id: r._id,
                        text: r.text,
                        user: r.user ? { id: r.user._id, username: r.user.username, email: r.user.email } : null,
                        createdAt: r.createdAt,
                        updatedAt: r.updatedAt,
                    })),
                })),
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
            },
        });
    } catch (err) {
        console.error("getPostById error:", err);
        return errorHandler(err, req, res);
    }
}

// Get posts of logged-in user
async function getMyPosts(req, res) {
    try {
        if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

        const posts = await Post.find({ author: req.user.id })
            .sort({ createdAt: -1 })
            .populate("author", "username email")
            .lean();

        return res.json({
            posts: posts.map((p) => ({
                id: p._id,
                title: p.title,
                content: p.content,
                author: p.author ? { id: p.author._id, username: p.author.username, email: p.author.email } : null,
                commentsCount: Array.isArray(p.comments) ? p.comments.length : 0,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
            })),
        });
    } catch (err) {
        console.error("getMyPosts error:", err);
        return errorHandler(err, req, res);
    }
}


// Update post (owner only — admins cannot update)
async function updatePost(req, res) {
    try {
        const { id } = req.params;
        const { title, content } = req.body || {};

        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        // Only the post owner can update (no admin override)
        const isOwner = req.user?.id && String(post.author) === req.user.id;
        if (!isOwner) return res.status(403).json({ error: "Forbidden" });

        if (title) post.title = String(title).trim();
        if (content) post.content = String(content).trim();
        await post.save();

        return res.json({
            message: "Post updated",
            post: {
                id: post._id,
                title: post.title,
                content: post.content,
                author: post.author,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
            },
        });
    } catch (err) {
        console.error("updatePost error:", err);
        return errorHandler(err, req, res);
    }
}


// Delete post (owner or admin)
async function deletePost(req, res) {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const isOwner = req.user?.id && String(post.author) === req.user.id;
        const isAdmin = !!req.user?.isAdmin;
        if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });

        await post.deleteOne();
        return res.json({ message: "Post deleted" });
    } catch (err) {
        console.error("deletePost error:", err);
        return errorHandler(err, req, res);
    }
}

module.exports = { createPost, getAllPosts, getPostById, updatePost, deletePost, getMyPosts };
