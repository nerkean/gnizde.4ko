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
  
  // 👇 1. Добавляем "new", "shipped", "canceled" в список разрешенных
  status: { 
    type: String, 
    enum: ["new", "pending", "paid", "shipped", "canceled", "failure", "error", "sandbox"], 
    default: "new" 
  },

  customer: {
    name: String,
    phone: String,
    email: String, // 👇 2. Добавляем email, он приходил с формы
    comment: String,
  },

  // 👇 3. Добавляем блок доставки, иначе адрес не сохранится!
  delivery: {
    type: { type: String }, // 'nova' | 'ukr' | 'courier'
    city: String,
    branch: String,
    address: String,
  },
  
  liqpayData: Object, 
}, { timestamps: true });

export default models.Order || model("Order", OrderSchema);