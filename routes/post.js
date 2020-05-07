const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

// GET POSTS
router.get('/', async(req, res) => {
    Post.find()
    .sort({ createdAt: -1 })
    .populate('author')
    .exec((err, posts) => {
        if(err) return res.status(500).json({ msg: err.message});
        if(posts.length < 1) return res.json({ msg: 'No post found.' });
        res.json(posts);
    });
});

// GET POST BY ID
router.get('/:id', async(req, res) => {
    Post.findById(req.params.id)
    .populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    })
    .exec((err, post) => {
        if(err) return res.status(404).json({ msg: "Post not found." });
        if(!post) return res.status(404).json({ msg: 'Post not found.' });
        return res.json(post);
    });
});

// ADD POST
router.post('/', auth, async(req, res) => {
    try{ 
        const newPost = new Post({
            author: req.user.id,
            text: req.body.text
        });
        const createdPost = await newPost.save();
        return res.status(201).json(createdPost);
    } catch(err) {
        return res.status(500).json({ msg: err.message });
    }
});

// UPDATE POST
router.put('/:id', auth, async(req, res) => {
    try{
        const getPost = await Post.findById(req.params.id);
        if(getPost.author == req.user.id) {
            const updatePost = await Post.findByIdAndUpdate(req.params.id, { $set:req.body }, {new: true});
            return res.json(updatePost);
        }
        return res.json({ msg: 'You are not the owner of this post.' });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
});

// REMOVE POST
router.delete('/:id', auth, async(req, res) => {
    try{
        const getPost = await Post.findById(req.params.id);
        if(getPost.author == req.user.id) {
            await Post.findByIdAndRemove(req.params.id);
            return res.json({ msg: 'Post Removed.' });
        }
        return res.json({ msg: 'You are not the owner of this post.'});
    } catch(err){
        return res.status(500).json({ msg: err.message });
    }
});

// ADD COMMMENT
router.post('/:id/comment', auth, async(req, res) => {
    try { 
        const getPost = await Post.findById(req.params.id);
        const newComment = await Comment.create({
            author: req.user.id,
            text: req.body.text 
        });
        await getPost.comments.push(newComment._id);
        const savePost = await getPost.save();
        Post.findById(savePost._id)
        .populate({
            path: "comments",
            populate: {
                path: "author"
            }
        })
        .exec((err, post) => {
            if(err) return res.status(500).json({ msg: err.messsage });
            return res.status(201).json(post);
        })
    } catch(err) {
        return res.status(500).json({ msg: err.message });
    }
});

// UPDATE COMMENT
router.put('/:id/comment/:commentId', auth, async(req, res) => {
    try {
        const getComment = await Comment.findById(req.params.commentId);
        let canUpdate = false;
        if(getComment.author == req.user.id) canUpdate = true;
        if(canUpdate) await getComment.update({ $set: req.body }, { new: true});
        Post.findById(req.params.id)
        .populate({
            path: "comments",
            populate: {
                path: "author"
            }
        })
        .exec((err, post) => {
            if(err) return res.status(500).json({ msg: err.message });
            return res.json(post);
        });
    } catch(err) {
        return res.status(500).json({ msg: err.message });
    }
});

// DELETE COMMENT
router.delete('/:id/comment/:commentId', auth, async(req, res) => {
    try {
        const getComment = await Comment.findById(req.params.commentId);
        let canDelete = false;
        if(getComment.author == req.user.id) canDelete = true;
        if(canDelete) await getComment.remove();
        Post.findById(req.params.id)
        .populate({
            path: 'comments',
            populate: {
                path: 'author'
            }
        })
        .exec((err, post) => {
            if(err) return res.status(500).json({ msg: err.message });
            return res.json(post);
        });
    } catch(err) {
        return res.status(500).json({ msg: err.message });
    }
});

module.exports = router;