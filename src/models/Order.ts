import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    items: [
      {
        id: String,
        title_ua: String,
        priceUAH: Number,
        qty: Number,
      },
    ],
    total: Number,
    currency: String,
    status: { type: String, default: "new" },
    customer: {
      name: String,
      phone: String,
      email: String,
      comment: String,
    },
    delivery: {
      type: { type: String },
      city: String,
      warehouse: String,
      branch: String,
      address: String,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Order = models.Order || model("Order", OrderSchema);
export default Order;