import { useParams, Navigate } from 'react-router-dom';
import { lazy, Suspense, useMemo } from 'react';
import { moduleRegistry } from '../core/module-registry.js';

export default function CategoryDetail() {
  const { moduleId } = useParams();
  const manifest = moduleRegistry.get(moduleId);

  const LazyDetail = useMemo(() => {
    if (!manifest?.Detail) return null;
    return lazy(() => manifest.Detail().then((c) => ({ default: c })));
  }, [manifest]);

  if (!manifest) return <Navigate to="/" replace />;
  if (!LazyDetail) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Nema detalja za ovaj modul.</div>;
  }

  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Učitavam…</div>}>
      <LazyDetail />
    </Suspense>
  );
}
