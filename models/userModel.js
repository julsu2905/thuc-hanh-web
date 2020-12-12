const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userAdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
      },
    photo: String,
    role: {
        type: String,
        enum: ['admin', 'operator', 'promoter','moderator'],
        default: 'operator'
      },
      password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
      },
      passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
          // This only works on CREATE and SAVE!!!
          validator: function(el) {
            return el === this.password;
          },
          message: 'Passwords are not the same!'
        }
      },
      passwordChangedAt: Date,
      passwordResetToken: String,
      passwordResetExpires: Date,
      active: {
        type: Boolean,
        default: true,
      }
});


//Encryption password for user
userAdminSchema.pre('save', async function(next) {
    //Only run this function if password was actually modified
    if(!this.isModified('password')) return next();
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    //Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});


//User compare password and passwordConfirm
userAdminSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
}
//User change passwordAfter login

userAdminSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

const User = mongoose.model('User', userAdminSchema);
module.exports = User;