// routes/commentRoutes.js
const router = require("express").Router();
const { verify } = require("../auth");
const comments = require("../controllers/commentController");

// Comments
router.post("/addComment/:postId", verify, comments.addComment);
router.patch("/updateComment/:postId/:commentId", verify, comments.updateComment);
router.delete("/deleteComment/:postId/:commentId", verify, comments.deleteComment);

// Replies
router.post("/replyComment/:postId/:commentId", verify, comments.replyToComment);
router.patch("/updateReply/:postId/:commentId/:replyId", verify, comments.updateReply);
router.delete("/deleteReply/:postId/:commentId/:replyId", verify, comments.deleteReply);

module.exports = router;
