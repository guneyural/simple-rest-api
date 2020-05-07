const mongoose = require('mongoose');
const Comment = require('./comment');

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    text: {type: String, required: true},
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, {timestamps: true});

postSchema.pre('remove', async function(next) {
    try { 
        const commentIds = [...this.comments];
        commentIds.forEach(async (id) => {
            await Comment.findByIdAndRemove(id)
        });
        return next();
    } catch (err) {
        return next(err);
    }
});

module.exports = mongoose.model('Post', postSchema);