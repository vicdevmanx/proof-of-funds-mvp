import mongoose, { Schema } from 'mongoose';

const certificateSchema = new Schema({
  certificateId: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true },
  holderName: { type: String, required: true },
  totalValue: { type: Number, required: true },
  balances: [{
    token: String,
    amount: Number,
    value: Number,
    chain: String,
    symbol: String,
    address: String,
    imgUrl: String,
  }],
  issueDate: { type: String, required: true },
  verificationDate: { type: String, required: true },
  certificateHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);

export default Certificate;