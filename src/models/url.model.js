import mongoose from "mongoose";

const urlRegex = /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i;

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      set: (v) => (/^https?:\/\//i.test(v) ? v.trim() : `https://${v.trim()}`),
      validate: {
        validator: (v) => urlRegex.test(v),
        message: "Invalid URL format",
      },
    },
    shortCode: { type: String, required: true, unique: true, index: true },
    clickCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// TTL index -> expire after 5 days
urlSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 5 });

urlSchema.methods.incrementClickCount = function () {
  this.clickCount += 1;
  return this.save();
};

export const Url = mongoose.model("Url", urlSchema);
