import type { Metadata } from "next";
import TimelineView from "@/components/TimelineView";

export const metadata: Metadata = { title: "年表 | Vanished Jobs Archive." };

export default function TimelinePage() {
  return <TimelineView />;
}
