import mongoose, { Schema, model, models } from "mongoose";

const ContentBlockSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true }, 
  type: { type: String, required: true }, 
  data: { type: Schema.Types.Mixed, default: {} },
  draft: { type: Boolean, default: false },
  version: { type: Number, default: 1 },
  updatedBy: { type: String, default: "content_editor" },
}, { timestamps: true });

export default models.ContentBlock || model("ContentBlock", ContentBlockSchema);
