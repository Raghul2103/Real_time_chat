import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Nullable for type: 'global'
      default: null,
    },
    type: {
      type: String,
      enum: ['global', 'private'],
      default: 'global',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Includes createdAt and updatedAt
  }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
