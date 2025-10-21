// routes/postRoutes.js
const router = require("express").Router();
const { verify } = require("../auth");
const pc = require("../controllers/postController");

router.post("/createPost", verify, pc.createPost);
router.get("/getPosts", pc.getAllPosts);
router.get("/getPost/:id", pc.getPostById);
router.get("/myPosts", verify, pc.getMyPosts);
router.patch("/updatePost/:id", verify, pc.updatePost);
router.delete("/deletePost/:id", verify, pc.deletePost);

module.exports = router;
