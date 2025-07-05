import mongoose from "mongoose"

const leadSchema = new mongoose.Schema({
  leadgenId: {
    type: String,
    required: true,
    unique: true,
  },
  formId: {
    type: String,
    required: true,
  },
  formName: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: null,
  },
  budget: {
    type: String,
    default: null,
  },
  plotSize: {
    type: String,
    default: null,
  },
  city: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["New", "Contacted", "Qualified", "Purchased"],
    default: "New",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  assignmentHistory: [
    {
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      note: String,
      assignedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  statusHistory: [
    {
      status: String,
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      changedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    default: null,
  },
})

export const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema)
