import { connectDB } from "@/lib/mongodb";
import ContentBlock from "@/models/ContentBlock";

export async function getContentBlock(key: string) {
  await connectDB();

  try {
    const doc = await ContentBlock.findOne({ key }).lean();
    return doc as any;
  } catch (e) {
    console.error("getContentBlock error:", e);
    return null;
  }
}
