import mongoose from 'mongoose';

const PaymentSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  walletAddress: {
    type: String,
    required: true,
  },
  holderName: {
    type: String,
    required: true,
  },
  balances: {
    type: Array,
    required: true,
  },
  totalValue: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Auto-delete after 1 hour
  },
});

const PaymentSession = mongoose.models.PaymentSession || mongoose.model('PaymentSession', PaymentSessionSchema);

export default PaymentSession;
