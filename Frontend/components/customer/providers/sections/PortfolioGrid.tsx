"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { PortfolioItem } from "../types";

export default function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  if (!items?.length) return <p className="text-gray-500">No portfolio items yet.</p>;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((it) => (
        <Link key={it.id} href={it.url || "#"} className="group block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative aspect-video">
            {/* Using next/image is optional; replace with <img> if you prefer */}
            <Image src={it.cover || "/placeholder.svg"} alt={it.title} fill className="object-cover" />
          </div>
          <div className="p-3">
            <div className="font-medium">{it.title}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {it.tags?.map((t) => <Badge key={t} variant="secondary" className="text-xxs">{t}</Badge>)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
