import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { MiningSession } from '../models/miningsession.model.js';

// Mining Controller for API Endpoints
export class MiningController {
  // Start a new mining session
  startMining = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    // Check for existing active session
    const activeSession = await MiningSession.findOne({
      user: userId,
      status: 'RUNNING',
    });

    if (activeSession) {
      throw new ApiError(400, 'Active mining session already exists');
    }

    // Create new 24-hour session
    const session = await MiningSession.create({
      userId,
      startTime: new Date(),
      // endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 10 * 60 * 1000),
      baseCoins: 100,
    });

    const response = new ApiResponse(
      201,
      'Mining session started successfully',
      session
    );
    return res.status(response.statusCode).json(response);
  });

  // Watch ad and get bonus
  //   watchAd = asyncHandler(async (req, res) => {
  //     const { userId } = req.body;

  //     const session = await MiningSession.findOne({
  //       user: userId,
  //       status: 'RUNNING',
  //     });

  //     if (!session) {
  //       throw new ApiError(400, 'No active mining session found');
  //     }

  //     // Check cooldown period (5 minutes)
  //     if (
  //       session.lastAdWatchTime &&
  //       Date.now() - session.lastAdWatchTime.getTime() < 5 * 60 * 1000
  //     ) {
  //       throw new ApiError(400, 'Please wait before watching another ad');
  //     }

  //     const updatedSession = await MiningSession.findByIdAndUpdate(
  //       session._id,
  //       {
  //         $inc: { bonusCoins: 20 },
  //         lastAdWatchTime: new Date(),
  //       },
  //       { new: true }
  //     );

  //     const response = new ApiResponse(
  //       200,
  //       'Ad bonus claimed successfully',
  //       updatedSession
  //     );
  //     return res.status(response.statusCode).json(response);
  //   });

  // Update mining session
  updateMiningSession = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const session = await MiningSession.findOne({
      userId,
      status: 'RUNNING',
    });

    if (!session) {
      throw new ApiError(400, 'No active mining session found');
    }

    const updatedSession = await MiningSession.findByIdAndUpdate(
      session._id,
      {
        $inc: { bonusCoins: 20 },
        // lastAdWatchTime: new Date(),
      },
      { new: true }
    );

    const response = new ApiResponse(
      200,
      'Ad bonus claimed successfully',
      updatedSession
    );
    return res.status(response.statusCode).json(response);
  });

  // Get current mining status
  getMiningStatus = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const session = await MiningSession.findOne({
      userId,
      status: 'RUNNING',
    });

    const response = new ApiResponse(
      200,
      'Mining status retrieved successfully',
      {
        isActive: !!session,
        timeRemaining: session ? Math.max(0, session.endTime - new Date()) : 0,
        totalCoins: session ? session.baseCoins + session.bonusCoins : 0,
        session: session || null,
      }
    );

    return res.status(response.statusCode).json(response);
  });
}

export const getUserMiningStatus = async (userId) => {
  const session = await MiningSession.findOne({
    userId,
    status: 'RUNNING',
  }).sort({ createdAt: -1, updatedAt: -1, _id: -1, userId: -1 });

  const response = {
    isActive: !!session,
    timeRemaining: session ? Math.max(0, session.endTime - new Date()) : 0,
    totalCoins: session ? session.baseCoins + session.bonusCoins : 0,
    session: session || null,
  };
  return response;
};
