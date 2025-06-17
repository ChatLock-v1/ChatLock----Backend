
import { User } from '../Models/User.Model.js';
import { generateToken } from '../utils/generateToken.js';
import dotenv from "dotenv"


dotenv.config()

import crypto from "crypto"
import bcrypt from 'bcryptjs';
import { getDataUri } from '../utils/dataUri.js';
import cloudinary from '../middleware/cloudinary.js';


export const registerUser = async (req, res) => {
  try {
    const { username, email, password, socketId } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'User already exists with this email or username.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save new user
    await User.create({
      username,
      email,
      password: hashedPassword,
      socketId
    });

    // Respond with safe user info
    res.status(201).json({
      message: 'User registered successfully.',

    });
  } catch (err) {
    console.error('❌ Registration Error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};






// login controller
export const loginUser = async (req, res) => {
  try {
    const { email, password, deviceInfo, socketId } = req.body;
    console.log(deviceInfo);


    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Update device info if not already stored
    if (deviceInfo && !user.loginDevices.includes(deviceInfo)) {
      user.loginDevices.push(deviceInfo);
    }

    user.loginCount = user.loginDevices.length;

    // Store current socketId if provided
    if (socketId && socketId !== user.socketId) {
      user.socketId = socketId;
    }

    await user.save();



    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      following: user.following,
      follower: user.follower,
      bio: user.bio,
      gender: user.gender,
      post: user.post,
      bookmark: user.bookmark,
      groups: user.groups,
      socketId: user.socketId,
      loginDevices: user.loginDevices,
      loginCount: user.loginCount,
      createdAt: user.createdAt,
    }
    const token = generateToken(user._id);
    console.log(token);


    return res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).json({ message: `Welcome back ${user.username}`, user: userData });


  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};







export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true, // set to true if using HTTPS
      sameSite: "Strict", // or "Lax", depending on your needs
    });
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Server error during logout." });
  }
};





// export const forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'User not found.' });

//     const resetToken = generateResetToken(user._id);

//     const resetLink = `http://:localhost:3000/user/reset-password/${resetToken}`
//     console.log(resetLink);


//     // Here you'd send an email. For now, just return the token.
//     res.status(200).json({
//       message: 'Reset token generated.',
//       resetToken, // send this via email in real app
//     });
//   } catch (err) {
//     console.error('Forgot Password Error:', err);
//     res.status(500).json({ message: 'Error generating reset token.' });
//   }
// };








// export const resetPassword = async (req, res) => {
//   const { token, newPassword } = req.body;

//   try {
//     const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);

//     const user = await User.findById(decoded.id).select('+password');
//     if (!user) return res.status(404).json({ message: 'User not found.' });

//     user.password = await bcrypt.hash(newPassword, 10);
//     await user.save();

//     res.status(200).json({ message: 'Password reset successful.' });
//   } catch (err) {
//     console.error('JWT Reset Password Error:', err);
//     res.status(400).json({ message: 'Invalid or expired token.' });
//   }
// };


export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId)
    return res.status(200).json({ user });
  } catch (error) {
    console.error(err);
    res.status(400).json({ message: 'feting profile give error' });
  }

}


export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, name, gender } = req.body
    const { profilePic } = req.file
    let cloudnaryResponse;

    if (profilePic) {
      const fileUri = getDataUri(profilePic)
      cloudnaryResponse = await cloudinary.uploader.upload(fileUri)
    }

    const user = await User.findById(userId)

    if (!user) return res.status(400).json({ message: 'User Not Found' });



    if (bio) user.bio = bio;
    if (name) user.bio = name;
    if (gender) user.gender = gender;
    if (profilePic) user.profilePic = cloudnaryResponse.secure_url;


    await user.save()


    return res.status(200).json({ user, success: true, message: "User Profile Updated" });


  } catch (error) {
    console.error(err);
    res.status(400).json({ message: 'Edit profile give error' });
  }

}

// export const getMutualSuggestions = async (req, res) => {
//   try {
//     const currentUser = await User.findById(req.id)
//       .populate('following', 'following');

//     const exclusiveList = [
//       ...currentUser.following.map(u => u._id.toString()),
//       currentUser._id.toString()
//     ];

//     let mutualMap = {};

//     currentUser.following.forEach(friend => {
//       friend.following.forEach(followerId => {
//         const id = followerId.toString();
//         if (!exclusiveList.includes(id)) {
//           mutualMap[id] = (mutualMap[id] || 0) + 1;
//         }
//       });
//     });

//     const potentialUsers = await User.find({
//       _id: { $nin: exclusiveList },
//       isActive: true,
//     }).select('username bio profilePic');

//     const suggestionsWithScore = potentialUsers.map(user => {
//       const score = mutualMap[user._id.toString()] || 0;
//       return { user, score };
//     });

//     const finalSuggestions = suggestionsWithScore
//       .sort((a, b) => b.score - a.score)
//       .slice(0, 10)
//       .map(item => item.user);

//     res.json({ suggestions: finalSuggestions });

//   } catch (err) {
//     console.error("❌ Error in suggestion:", err);
//     res.status(500).json({ message: 'Server error while fetching suggestions' });
//   }
// };




// | Step   | Kya ho raha hai?                                       |
// | ------ | ------------------------------------------------------ |
// | Step 1 | Current user aur uske followings la rahe hain          |
// | Step 2 | Already-followed + self IDs nikaal rahe hain           |
// | Step 3 | Har mutual connection ka score calculate kar rahe hain |
// | Step 4 | Baaki active users nikaal rahe hain                    |
// | Step 5 | Sirf mutual score ke basis pe sort kar rahe hain       |
// | Step 6 | Top 10 suggest kar rahe hain                           |

// export const getMutualSuggestions = async (req, res) => {
//   try {
//     const currentUser = await User.findById(req.id)
//       .populate('following', 'following');

//     if (!currentUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Step 1: List of already followed + self
//     const exclusiveList = [
//       ...currentUser.following.map(u => u._id.toString()),
//       currentUser._id.toString()
//     ];

//     // Step 2: Count mutual connections
//     let mutualMap = {};
//     currentUser.following.forEach(friend => {
//       friend.following.forEach(followerId => {
//         const id = followerId.toString();
//         if (!exclusiveList.includes(id)) {
//           mutualMap[id] = (mutualMap[id] || 0) + 1;
//         }
//       });
//     });

//     // Step 3: Find potential users
//     const potentialUsers = await User.find({
//       _id: { $nin: exclusiveList },
//       isActive: true,
//     }).select('username bio profilePic lastLogin createdAt');

//     const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
//     const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

//     // Step 4: Score users
//     const suggestionsWithScore = potentialUsers.map(user => {
//       const mutualScore = mutualMap[user._id.toString()] || 0;

//       const isActiveRecently = user.lastLogin && user.lastLogin > oneDayAgo;
//       const activeBoost = isActiveRecently ? 1 : 0;

//       const isNewUser = user.createdAt > oneWeekAgo;
//       const newUserBoost = isNewUser ? 0.5 : 0;

//       const totalScore = mutualScore + activeBoost + newUserBoost;

//       return {
//         ...user.toObject(),
//         mutualConnections: mutualScore,
//         score: totalScore,
//       };
//     });

//     // Step 5: Sort & limit top 10
//     const finalSuggestions = suggestionsWithScore
//       .sort((a, b) => b.score - a.score)
//       .slice(0, 10);

//     res.json({ suggestions: finalSuggestions });

//   } catch (err) {
//     console.error("❌ Error in suggestion:", err);
//     res.status(500).json({ message: 'Server error while fetching suggestions' });
//   }
// };



export const getSuggestedUser = async (req, res) => {
  try {

    const currentUser = req.id;
    const suggestionUxser = await User.find({ id: { $ne: currentUser } }).select("-password")

    if (!suggestionUxser) return res.status(400).json({ message: "Suggested user not found" });

    return res.status(200).json({
      success: true,
      users: suggestionUxser
    })



  } catch (error) {
    console.error(err);
    res.status(400).json({ message: 'SuggestedUser give error' });
  }
}




export const followORUnfollow = async (req, res) => {
  try {
    const followKarneWala = req.id;

    const jiskoFollweKruga = req.params.id;

    if (followKarneWala === jiskoFollweKruga) {
      return res.status(400).json({ message: "You can follow/unfollow userself" })
    }

    const user = await User.findById(followKarneWala)

    const targetUser = await User.findById(jiskoFollweKruga)

    if (!user || !targetUser) {
      return res.status(400).json({ message: "User Not Found" })
    }

    const isFollow = user.following.includes(targetUser)


    if (isFollow) {
      await Promise.all([
        //unfollw
        user.updateOne({ _id: followKarneWala }, { $pull: { following: jiskoFollweKruga } }),
        user.updateOne({ _id: jiskoFollweKruga }, { $pull: { follower: followKarneWala } })
      ])
      res.status(200).json({ message: "Unfollow Successfullly" })
    } else {
      //follow
      await Promise.all([
        user.updateOne({ _id: followKarneWala }, { $push: { following: jiskoFollweKruga } }),
        user.updateOne({ _id: jiskoFollweKruga }, { $push: { follower: followKarneWala } })
      ])
      res.status(200).json({ message: "follow Successfullly" })
    }
  } catch (error) {
    console.error(err);
    res.status(400).json({ message: 'FollowORUnfollow give error' });
  }
}