import mongoose from 'mongoose';

const userEventRegistrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  registrationDate: { type: Date, default: Date.now },
});

export const UserEventRegistration = mongoose.model(
  'UserEventRegistration',
  userEventRegistrationSchema
);
