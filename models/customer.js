const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  whatsAppNumber: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{10}$/  // Only 10 digits India
  },
  course: {
    type:String,
    required: true,
  },
  serviceType: {
    type: String,
    enum: ["ppt", "assessment", "resume"],
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  deadline: {
    type: Date,
    required: true
  },
   qualification: {
      type: String,
      trim: true
    },
    experience: {
      type: String,
      trim: true
    },
    certifications: {
      type: String,
      trim: true
    },
    specialization: {
        type: String,
        trim: true
    },
  additionalNotes: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "Cancelled"],
    default: "pending"
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid"],
    default: "unpaid"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
