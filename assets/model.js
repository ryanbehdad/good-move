export const categories = {
  all: 'All routines', daily: 'Daily care', tennis: 'Tennis', gym: 'Gym', recovery: 'Strength & recovery',
};
export const categoryFor = group => ({ tennis: 'tennis', gym: 'gym', strength: 'recovery', recovery: 'recovery', shoulder: 'recovery' })[group] || 'daily';
export function parseRoute(hash, routines) {
  let key;
  try { key = decodeURIComponent(hash).replace(/^#\/?/, '').replace(/^r\//i, '').toUpperCase(); }
  catch { return null; }
  return routines.find(routine => routine.id === key) || null;
}
export const requiresReview = (exercise, item) => exercise.reviewRequired || exercise.condition === 'review' || item.condition === 'review';
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
