const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// define the person schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: number,
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
        type: boolean,
        default: false
    }
});


userSchema.pre('save', async function (next) {
    const person = this;

    // hash the password only if it has been modified (or is new)
    if (!person.isModified('password')) return next();
    try {
        // hash password generation
        const salt = await bcrypt.genSalt(10);

        // hash password
        const hashedpassword = await bcrypt.hash(person.password, salt);

        // override the plain password with the hashed one
        person.password = hashedpassword;
        next();
    } catch (err) {
        return next(err);
    }
})

userSchema.methods.comparepassword = async function (candidatepassword) {
    try {
        // use bcrypt to compare the provide password with the hashed password
        const isMatch = await bcrypt.compare(candidatepassword, this.password);
        return isMatch;
    } catch (err) {
        throw err;
    }
}

const User = mongoose.model('User', userSchema);
module.exports = User;