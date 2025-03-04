import cron from 'node-cron';
import mongoose from 'mongoose';
import { MiningSession } from '../models/miningsession.model.js';
import { Wallet } from '../models/wallet.model.js';
import { initializeWallet } from '../controllers/referralController.js';

// Mining Service for Cron Operations
export class MiningService {
  static initializeCronJob() {
    // Run at 12 AM every night
    // cron.schedule('0 0 * * *', async () => {
    //   console.log('Running daily mining completion check at:', new Date());
    //   await this.processMiningCompletions();
    // });
    // Run every minute
    cron.schedule('* * * * *', async () => {
      console.log('Running mining completion check at:', new Date());
      await this.processMiningCompletions();
    });
  }

  static async processMiningCompletions() {
    try {
      // Find all running sessions that have exceeded their end time
      const completableSessions = await MiningSession.find({
        status: 'RUNNING',
        endTime: { $lte: new Date() },
      }).populate('userId');

      console.log(`Found ${completableSessions.length} sessions to complete`);

      for (const session of completableSessions) {
        await this.completeMiningSession(session._id);
      }
    } catch (error) {
      console.error('Error in processMiningCompletions:', error);
    }
  }

  static async completeMiningSession(sessionId) {
    const session = await mongoose.startSession();
    await session.startTransaction();

    try {
      const miningSession = await MiningSession.findById(sessionId);

      if (!miningSession || miningSession.status !== 'RUNNING') {
        return;
      }

      const totalCoins = miningSession.baseCoins + miningSession.bonusCoins;

      // Update session status
      await MiningSession.findByIdAndUpdate(
        sessionId,
        { status: 'COMPLETED' },
        { session }
      );

      const wallet = await Wallet.findOne({ userId: miningSession.userId });
      if (!wallet) {
        // await Wallet.create({ userId: miningSession.userId, balance: totalCoins });
        await initializeWallet(miningSession.userId, session);
      }
      
      // Credit user's wallet
      await Wallet.findOneAndUpdate(
        { userId: miningSession.userId },
        {
          $inc: { balance: totalCoins },
        },
        { session }
      );
      
      await session.commitTransaction();
      console.log(
        `Completed mining session ${sessionId} with ${totalCoins} coins`
      );
    } catch (error) {
      await session.abortTransaction();
      console.error(`Error completing mining session ${sessionId}:`, error);
    } finally {
      session.endSession();
    }
  }
}
