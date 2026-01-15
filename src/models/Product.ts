import mongoose, { Schema, model, models } from "mongoose";

export type ProductDoc = {
  _id: string;
  title_ua: string;
  slug: string;
  priceUAH: number;
  category?: string;
  images: string[];
  desc_ua?: string;
  stock?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;

  // 👇 ТИПИЗАЦИЯ НОВЫХ ПОЛЕЙ (Ты забыл их здесь)
  showDetailsBlocks?: boolean; 
  availability?: "in_stock" | "on_order" | "out_of_stock"; 
  details_ua?: string;  // <--- Добавил
  delivery_ua?: string; // <--- Добавил
};

const ProductSchema = new Schema<ProductDoc>(
  {
    title_ua: { type: String, required: true, trim: true },
    slug:     { type: String, required: true, unique: true, index: true },
    priceUAH: { type: Number, required: true, min: 0 },
    category: { type: String, trim: true },
    images:   { type: [String], default: [] },
    desc_ua:  { type: String, default: "" },
    stock:    { type: Number, default: 0 },
    active:   { type: Boolean, default: true },

    showDetailsBlocks: {   
      type: Boolean,
      default: false,
    },

    availability: {  
      type: String,
      enum: ["in_stock", "on_order", "out_of_stock"],
      default: "in_stock",
    },
    
    // В схеме у тебя все было верно:
    details_ua: { type: String, default: "" }, // Лучше добавить default: "", чтобы в React не было ошибок с null
    delivery_ua: { type: String, default: "" }, 
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProductSchema.virtual("imageUrl").get(function (this: any) {
  return Array.isArray(this.images) && this.images.length ? this.images[0] : "";
});

ProductSchema.index({ active: 1, createdAt: -1 });
ProductSchema.index({ category: 1, active: 1 });

export default models.Product || model<ProductDoc>("Product", ProductSchema);