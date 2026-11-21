import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

export type WithId<T> = T & { id: string };

/**
 * Lit/écrit une collection Firestore avec repli automatique sur un contenu de
 * démonstration local tant que le projet Firebase de l'association n'est pas
 * configuré (voir README). En mode démo, les actions d'ajout/modification/
 * suppression restent fonctionnelles (en mémoire) pour pouvoir tester l'app.
 */
export function useCollection<T extends Record<string, unknown>>(
  collectionName: string,
  demoSeed: WithId<T>[],
  orderByField?: string
) {
  const [demoItems, setDemoItems] = useState<WithId<T>[]>(demoSeed);
  const [remoteItems, setRemoteItems] = useState<WithId<T>[] | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;
    const baseRef = collection(db, collectionName);
    const q = orderByField ? query(baseRef, orderBy(orderByField, 'desc')) : query(baseRef);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setRemoteItems(
          snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as T) }))
        );
        setLoading(false);
      },
      (error) => {
        console.warn(`[useCollection:${collectionName}]`, error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [collectionName, orderByField]);

  const items = isFirebaseConfigured ? remoteItems ?? [] : demoItems;

  const add = useCallback(
    async (data: T) => {
      if (isFirebaseConfigured && db) {
        const ref = await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: serverTimestamp(),
        });
        return ref.id;
      }
      const id = `demo-${Date.now()}`;
      setDemoItems((prev) => [{ id, ...data }, ...prev]);
      return id;
    },
    [collectionName]
  );

  const update = useCallback(
    async (id: string, data: Partial<T>) => {
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, collectionName, id), data as Record<string, unknown>);
      } else {
        setDemoItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...data } : item))
        );
      }
    },
    [collectionName]
  );

  const remove = useCallback(
    async (id: string) => {
      if (isFirebaseConfigured && db) {
        await deleteDoc(doc(db, collectionName, id));
      } else {
        setDemoItems((prev) => prev.filter((item) => item.id !== id));
      }
    },
    [collectionName]
  );

  return useMemo(
    () => ({ items, loading, add, update, remove, isDemo: !isFirebaseConfigured }),
    [items, loading, add, update, remove]
  );
}
