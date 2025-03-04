import mongoose, { Schema } from 'mongoose';

// Wallet Schema
const WalletSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    balance: { type: Number, default: 0 },
    // transactions: [
    //   {
    //     amount: Number,
    //     type: { type: String, enum: ['CREDIT', 'DEBIT'] },
    //     description: String,
    //     createdAt: { type: Date, default: Date.now },
    //   },
    // ],
  },
  { timestamps: true }
);

export const Wallet = mongoose.model('Wallet', WalletSchema);
