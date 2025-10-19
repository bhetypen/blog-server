// controllers/commentController.js
const Post = require("../models/Post");
const { errorHandler } = require("../auth");

// Add comment (any user; admins forbidden)
async function addComment(req, res) {
    try {
        if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });
        if (req.user.isAdmin) return res.status(403).json({ error: "Admins cannot post comments" });

        const { postId } = req.params;
        const { text } = req.body || {};
        if (!text || !String(text).trim()) return res.status(400).json({ error: "Comment text is required" });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: "Post not found" });

        post.comments.push({ user: req.user.id, text: String(text).trim() });
        await post.save();

        const added = post.comments[post.comments.length - 1];
        return res.status(201).json({
            message: "Comment added",
            comment: {
                id: added._id,
                user: added.user,
                text: added.text,
                createdAt: added.createdAt,
                updatedAt: added.updatedAt,
            },
        });
    } catch (err) {
        console.error("addComment error:", err);
        return errorHandler(err, req, res);
    }
}

// Update comment (owner only; admins forbidden)
async function updateComment(req, res) {
    try {
        if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });
        if (req.user.isAdmin) return res.status(403).json({ error: "Admins cannot edit comments" });

        const { postId, commentId } = req.params;
        const { text } = req.body || {};
        if (!text || !String(text).trim()) return res.status(400).json({ error: "Comment text is required" });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        const isOwner = String(comment.user) === req.user.id;
        if (!isOwner) return res.status(403).json({ error: "Forbidden" });

        comment.text = String(text).trim();
        await post.save();

        return res.json({
            message: "Comment updated",
            comment: {
                id: comment._id,
                user: comment.user,
                text: comment.text,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
            },
        });
    } catch (err) {
        console.error("updateComment error:", err);
        return errorHandler(err, req, res);
    }
}

// Delete comment (owner or admin)
async function deleteComment(req, res) {
    try {
        if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

        const { postId, commentId } = req.params;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        const isOwner = String(comment.user) === req.user.id;
        const isAdmin = !!req.user.isAdmin;
        if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });

        comment.deleteOne(); // remove embedded subdoc
        await post.save();

        return res.json({ message: "Comment deleted" });
    } catch (err) {
        console.error("deleteComment error:", err);
        return errorHandler(err, req, res);
    }
}

// Post author replies to a comment (only post author allowed)
async function replyToComment(req, res) {
    try {
        if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

        const { postId, commentId } = req.params;
        const { text } = req.body || {};
        if (!text || !String(text).trim()) return res.status(400).json({ error: "Reply text is required" });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: "Post not found" });

        // Only the post author can reply
        if (String(post.author) !== req.user.id) {
            return res.status(403).json({ error: "Only the post author can reply to comments" });
        }

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        comment.replies.push({ user: req.user.id, text: String(text).trim() });
        await post.save();

        const reply = comment.replies[comment.replies.length - 1];
        return res.status(201).json({
            message: "Reply added",
            reply: {
                id: reply._id,
                user: reply.user,
                text: reply.text,
                createdAt: reply.createdAt,
                updatedAt: reply.updatedAt,
            },
        });
    } catch (err) {
        console.error("replyToComment error:", err);
        return errorHandler(err, req, res);
    }
}

// Edit a reply (only post author, editing their own reply)
async function updateReply(req, res) {
    try {
        if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

        const { postId, commentId, replyId } = req.params;
        const { text } = req.body || {};
        if (!text || !String(text).trim()) return res.status(400).json({ error: "Reply text is required" });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: "Post not found" });

        // Only post author can edit replies (their own)
        if (String(post.author) !== req.user.id) {
            return res.status(403).json({ error: "Only the post author can edit replies" });
        }

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        const reply = comment.replies.id(replyId);
        if (!reply) return res.status(404).json({ error: "Reply not found" });

        if (String(reply.user) !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" });
        }

        reply.text = String(text).trim();
        await post.save();

        return res.json({
            message: "Reply updated",
            reply: {
                id: reply._id,
                user: reply.user,
                text: reply.text,
                createdAt: reply.createdAt,
                updatedAt: reply.updatedAt,
            },
        });
    } catch (err) {
        console.error("updateReply error:", err);
        return errorHandler(err, req, res);
    }
}

// Delete a reply (post author who wrote it OR admin)
async function deleteReply(req, res) {
    try {
        if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

        const { postId, commentId, replyId } = req.params;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        const reply = comment.replies.id(replyId);
        if (!reply) return res.status(404).json({ error: "Reply not found" });

        const isOwner = String(reply.user) === req.user.id;           // post author who wrote it
        const isAdmin = !!req.user.isAdmin;
        if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });

        reply.deleteOne();
        await post.save();

        return res.json({ message: "Reply deleted" });
    } catch (err) {
        console.error("deleteReply error:", err);
        return errorHandler(err, req, res);
    }
}

module.exports = {
    addComment,
    updateComment,
    deleteComment,
    replyToComment,
    updateReply,
    deleteReply,
};
