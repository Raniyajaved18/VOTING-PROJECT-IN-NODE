const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// define the person schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String
    },
    mobile: {
        type: String,
    },
    address: {
        type: String,
        required: true
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }
});


userSchema.pre('save', async function (next) {
    const person = this;

    // hash the password only if it has been modified (or is new)
    if (!person.isModified('password')) return next();
    try {
        // hash password generation
        const salt = await bcryptjs.genSalt(10);

        // hash password
        const hashedpassword = await bcryptjs.hash(person.password, salt);

        // override the plain password with the hashed one
        person.password = hashedpassword;
        next();
    } catch (err) {
        return next(err);
    }
})

userSchema.methods.comparepassword = async function (candidatepassword) {
    try {
        // use bcryptjs to compare the provide password with the hashed password
        const isMatch = await bcryptjs.compare(candidatepassword, this.password);
        return isMatch;
    } catch (err) {
        throw err;
    }
}

const User = mongoose.model('User', userSchema);
module.exports = User;