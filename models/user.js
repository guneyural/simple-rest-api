const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Post = require('./post');
const Comment = require('./comment');

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required:true, unique: true},
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(this.password, salt);

        this.password = hashed;

        return next();
    } catch (err) {
        return next(err);
    }
});

userSchema.pre('remove', async function(next) {
    try {
        await Post.remove({ author: this._id });
        await Comment.remove({ author: this._id });
        next();
    } catch (err) {
        return next(err);
    }
});

userSchema.methods.comparePassword = async function(password, cb) {
    try {
        const compPassword = await bcrypt.compare(password, this.password);
        return cb(null, compPassword);
    } catch(err) {
        return cb(err, null);
    }
}

module.exports = mongoose.model('User', userSchema);