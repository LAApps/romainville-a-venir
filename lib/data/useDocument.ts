import { useCallback, useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

/**
 * Lit/écrit un document Firestore unique (singleton), avec le même repli de
 * démonstration que useCollection tant que le projet Firebase n'est pas
 * configuré.
 */
export function useDocument<T extends Record<string, unknown>>(
  collectionName: string,
  docId: string,
  demoSeed: T
) {
  const [demoData, setDemoData] = useState<T>(demoSeed);
  const [remoteData, setRemoteData] = useState<T | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;
    const unsubscribe = onSnapshot(
      doc(db, collectionName, docId),
      (snapshot) => {
        setRemoteData(snapshot.exists() ? (snapshot.data() as T) : null);
        setLoading(false);
      },
      (error) => {
        console.warn(`[useDocument:${collectionName}/${docId}]`, error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [collectionName, docId]);

  const data = isFirebaseConfigured ? remoteData ?? demoSeed : demoData;

  const save = useCallback(
    async (partial: Partial<T>) => {
      if (isFirebaseConfigured && db) {
        await setDoc(doc(db, collectionName, docId), partial, { merge: true });
      } else {
        setDemoData((prev) => ({ ...prev, ...partial }));
      }
    },
    [collectionName, docId]
  );

  return useMemo(
    () => ({ data, loading, save, isDemo: !isFirebaseConfigured }),
    [data, loading, save]
  );
}
