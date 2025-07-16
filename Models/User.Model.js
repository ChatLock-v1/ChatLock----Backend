// const mongoose = require('mongoose');
// const crypto = require('crypto');
import mongoose from "mongoose";
import crypto from "crypto"

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_.-]*$/,
    },

    name: {
      type: String,
      //   required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    profilePic: {
      type: String,
      default: 'https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg',
    },

    bio: {
      type: String,
      default: 'ChatLock User',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    isActive: {
      type: String,
      enum: ['Online', 'Offline']
    },
    loginDevices: {
      type: [String],
      default: [],
    },

    loginCount: {
      type: Number,
      default: 0,
    },

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    follower: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    post: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
      },
    ],

    bookmark: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
      },
    ],

    // Groups user is part of - array of group IDs
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
      },
    ],

    // Current socket ID (for real-time communication)
    socketId: {
      type: String,
      default: null,
    },
    agree:{
      type:Boolean,
      required:true,
      // default:false 
    },

    // Password reset fields
    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_, ret) {
        delete ret.password;
        delete ret.__v;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
      },
    },
  }
);

// Method to generate password reset token
userSchema.methods.generateResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  this.resetPasswordToken = hashedToken;
  this.resetPasswordExpires = Date.now() + 1000 * 60 * 10; // 10 minutes

  return rawToken; // send to user via email
};

// Optional TTL index for cleanup
userSchema.index({ resetPasswordExpires: 1 }, { expireAfterSeconds: 600 });

export const User = mongoose.model('User', userSchema);


