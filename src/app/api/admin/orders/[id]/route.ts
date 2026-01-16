import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; 
  const body = await req.json().catch(() => ({}));
  const status = body.status as string;

  await connectDB();
  const order = await Order.findByIdAndUpdate(id, { $set: { status } }, { new: true });
  if (!order) return NextResponse.json({ ok: false }, { status: 404 });

  return NextResponse.json({ ok: true, order });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; 
  await connectDB();
  await Order.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
