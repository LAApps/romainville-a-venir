// Reconnaît les formats d'URL YouTube couramment partagés (watch, youtu.be,
// live, embed, shorts) pour en tirer l'identifiant de vidéo, utilisé pour
// générer la miniature et le lecteur intégré dans l'application.
export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([\w-]{11})/,
    /youtube\.com\/live\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getYoutubeThumbnail(url: string): string | null {
  const id = extractYoutubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export function getYoutubeEmbedUrl(url: string, autoplay = false): string | null {
  const id = extractYoutubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}${autoplay ? '?autoplay=1&playsinline=1' : ''}`;
}
