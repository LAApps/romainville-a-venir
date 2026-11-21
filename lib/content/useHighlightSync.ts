import { useCollection } from '../data/useCollection';
import type { Highlight } from './types';

/**
 * Permet à n'importe quel écran de contenu (articles, ateliers, publications
 * du conseil municipal...) de créer/retirer en un clic une mise en avant sur
 * l'accueil liée à sa propre publication, via un `sourceRef` stable
 * (ex. "article-abc123") qui identifie la mise en avant correspondante.
 */
export function useHighlightSync() {
  const { items, add, update, remove } = useCollection<Highlight>('highlights', []);

  const isFeatured = (sourceRef: string) => items.some((h) => h.sourceRef === sourceRef);

  const syncHighlight = async (
    sourceRef: string,
    enabled: boolean,
    data: { titre: string; description?: string; imageUrl: string; rubriqueHref: string }
  ) => {
    const existing = items.find((h) => h.sourceRef === sourceRef);
    if (enabled) {
      const highlight: Highlight = {
        titre: data.titre,
        description: data.description ?? '',
        imageUrl: data.imageUrl,
        destination: 'rubrique',
        rubriqueHref: data.rubriqueHref,
        sourceRef,
      };
      if (existing) await update(existing.id, highlight);
      else await add(highlight);
    } else if (existing) {
      await remove(existing.id);
    }
  };

  return { isFeatured, syncHighlight };
}
