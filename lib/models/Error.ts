import mongoose from "mongoose"

const errorSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  stack: String,
  context: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const Error = mongoose.models.Error || mongoose.model("Error", errorSchema)
