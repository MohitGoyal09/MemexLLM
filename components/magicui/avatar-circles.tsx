"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: Array<{
    imageUrl: string;
    profileUrl?: string;
  }>;
}

export const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls,
}: AvatarCirclesProps) => {
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {avatarUrls.map((avatar, index) => (
        <a
          key={index}
          href={avatar.profileUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="relative h-10 w-10 hover:z-10 hover:scale-110 transition-transform"
        >
          <img
            className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800 object-cover"
            src={avatar.imageUrl}
            alt={`Avatar ${index + 1}`}
            width={40}
            height={40}
          />
        </a>
      ))}
      {(numPeople ?? 0) > 0 && (
        <a
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black hover:z-10 hover:scale-110 transition-transform"
          href="#"
        >
          +{numPeople}
        </a>
      )}
    </div>
  );
};
