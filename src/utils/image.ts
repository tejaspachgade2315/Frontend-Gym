export const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
      <rect width="480" height="320" fill="#F3F4F6" />
      <rect x="24" y="24" width="432" height="272" rx="16" fill="#E5E7EB" />
      <path d="M120 220l70-80 60 70 50-60 80 90H120z" fill="#CBD5E1" />
      <circle cx="170" cy="120" r="24" fill="#CBD5E1" />
      <text x="240" y="175" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#6B7280">Image unavailable</text>
    </svg>`,
  );

export const getSafeImageUrl = (url?: string | null) => {
  if (!url) return FALLBACK_IMAGE;
  if (url.includes("res.cloudinary.com/dfmrdo2fq")) return FALLBACK_IMAGE;
  return url;
};
