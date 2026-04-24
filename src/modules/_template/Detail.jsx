import ModuleDetail from '../_shared/ModuleDetail.jsx';
import manifest from './manifest.js';

// Most modules just delegate to the shared layout. If a category needs a
// custom detail screen (e.g. workout logs with sets/reps, a reading page
// tracker with per-book progress), replace this file's body with your own
// layout. You can still import + compose pieces from _shared.
export default function TemplateDetail() {
  return <ModuleDetail manifest={manifest} />;
}
