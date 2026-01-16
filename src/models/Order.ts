import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new Schema({
  orderId: { type: String, required: true, unique: true },
  items: [{
    id: String,
    title_ua: String,
    priceUAH: Number,
    qty: Number,
  }],
  total: Number,
  currency: { type: String, default: "UAH" },
  status: { 
    type: String, 
    enum: ["new", "pending", "paid", "shipped", "canceled", "failure", "error", "sandbox"], 
    default: "new" 
  },
  customer: {
    name: String,
    phone: String,
    email: String,
    comment: String,
  },
  delivery: {
    type: { type: String }, 
    city: String,
    branch: String,
    address: String,
  },
  liqpayData: Object, 
}, { timestamps: true });

export default models.Order || model("Order", OrderSchema);