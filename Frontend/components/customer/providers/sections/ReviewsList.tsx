"use client";

import { Star } from "lucide-react";
import type { Review } from "../types";

export default function ReviewsList({ reviews }: { reviews: Review[] }) {
  if (!reviews?.length) return <p className="text-gray-500">No reviews yet.</p>;
  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id} className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="font-medium">{r.author}</div>
            <div className="flex items-center gap-1 text-yellow-600">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-semibold">{r.rating}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString()}</div>
          <p className="mt-2 text-gray-700">{r.text}</p>
        </div>
      ))}
    </div>
  );
}
