"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Globe, FileText } from "lucide-react";
import type { PortfolioItem } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  if (!items?.length) return <p className="text-gray-500">No portfolio items yet.</p>;
  
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((it) => {
        // Normalize the cover URL
        const normalizedCover = it.cover?.replace(/\\/g, "/") || "";
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(normalizedCover);
        const imageUrl = normalizedCover.startsWith("http")
          ? normalizedCover
          : normalizedCover.startsWith("/")
          ? `${API_BASE}${normalizedCover}`
          : normalizedCover
          ? `${API_BASE}/${normalizedCover}`
          : null;
        
        const linkUrl = it.url && it.url !== "#" ? it.url : "#";
        const isExternalLink = linkUrl !== "#";
        
        return (
          <div key={it.id} className="group block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
            <div className="relative aspect-video bg-gray-100">
              {imageUrl && isImage ? (
                <img
                  src={imageUrl}
                  alt={it.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
                          <div class="text-center p-4">
                            <div class="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                              </svg>
                            </div>
                            <p class="text-xs text-gray-500">Portfolio</p>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
              ) : imageUrl ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
                  <div className="text-center p-4">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-500">Portfolio</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
                  <div className="text-center p-4">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Globe className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-500">Portfolio</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="font-medium line-clamp-1">{it.title}</div>
              {it.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{it.description}</p>
              )}
              {it.tags && it.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {it.tags.slice(0, 4).map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                  {it.tags.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{it.tags.length - 4}
                    </Badge>
                  )}
                </div>
              )}
              {isExternalLink && (
                <div className="mt-2">
                  <Link
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Project
                    <Globe className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
