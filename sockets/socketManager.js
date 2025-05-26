// import User from "../Models/User.Model.js";

import { User } from "../Models/User.Model.js";

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🟢 Socket connected:', socket.id);

    // Register user socketId
    socket.on('registerSocket', async (userId) => {
      try {
        const user = await User.findById(userId);
        if (user) {
          user.socketId = socket.id;
          await user.save();
          console.log(`✅ Updated socketId for user ${user.username}`);
        }
      } catch (err) {
        console.error('❌ Error updating socketId:', err);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log('🔴 Socket disconnected:', socket.id);
      try {
        await User.findOneAndUpdate(
          { socketId: socket.id },
          { $set: { socketId: null } }
        );
        console.log(`✅ Cleared socketId for disconnected socket`);
      } catch (err) {
        console.error('❌ Error clearing socketId:', err);
      }
    });
  });
};


