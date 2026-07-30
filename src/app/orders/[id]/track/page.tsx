"use server";

import { getOrderTrackingData } from "@/actions/delivery/orders";
import OrderTrackingClient from "./OrderTrackingClient";
import Link from "next/link";

export default async function CustomerOrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const data = await getOrderTrackingData(id);

  if (!data || !data.order) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-3xl text-ink">Order Not Found</h1>
        <p className="text-sm text-olive-dark mt-2">The order tracking link may be invalid or expired.</p>
        <Link href="/" className="mt-6 px-6 py-3 bg-ink text-lime font-mono text-xs uppercase tracking-widest">
          Return Home
        </Link>
      </div>
    );
  }

  return <OrderTrackingClient initialData={data} orderId={id} />;
}
