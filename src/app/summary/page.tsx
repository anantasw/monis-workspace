import type { Metadata } from "next";
import { SummaryView } from "@/components/summary/summary-view";
import { env } from "@/server/env";

export const metadata: Metadata = {
  title: "Your setup",
  description: "Check your Bali workspace, choose the rental length and send a rent request to monis.rent.",
};

export default function SummaryPage() {
  // Only the public number crosses to the client, not the whole env object.
  return <SummaryView whatsappNumber={env.MONIS_WHATSAPP_NUMBER ?? null} />;
}
