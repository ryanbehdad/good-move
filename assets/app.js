import { categories, categoryFor, parseRoute, requiresReview, escapeHtml as esc } from './model.js';

const app = document.querySelector('#app');
const status = document.querySelector('#viewstatus');
let data;
let exercises;
let category = 'all';
let homeScroll = 0;
const external = 'target="_blank" rel="noopener noreferrer"';
const safety = 'These routines are educational suggestions, not personal medical clearance. Skip movements requiring clinician approval until individually cleared. Tennis and gym warm-ups do not override restrictions on neck or shoulder loading. Stop for worsening pain, radiating symptoms, numbness, dizziness or new weakness.';

document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  app.focus({ preventScroll: true });
  app.scrollIntoView({ behavior: 'instant' });
});

function image(exercise, className = '', eager = false) {
  return `<div class="photo ${className}"><span class="image-fallback">Photo unavailable · use the original source below</span><img src="${esc(exercise.photo.url)}" alt="${esc(exercise.name)} — ${esc(exercise.photo.publisher)}" loading="${eager ? 'eager' : 'lazy'}" referrerpolicy="no-referrer"></div>`;
}

function routineRow(routine, index) {
  return `<a class="routine" href="#r/${routine.id}">
    <span class="routine-number">${String(index + 1).padStart(2, '0')}</span>
    <div class="routine-copy"><span class="eyebrow">${esc(routine.when)}</span><h3>${esc(routine.title)}</h3><p>${esc(routine.subtitle)}</p></div>
    <span class="routine-meta">${esc(routine.time)}<small>${routine.core.length} main movements</small></span><span class="arrow" aria-hidden="true">↗</span>
  </a>`;
}

function routineList() {
  return data.routines.filter(r => category === 'all' || categoryFor(r.group) === category).map(r => routineRow(r, data.routines.indexOf(r))).join('');
}

function home() {
  document.title = 'Good Move · Movement routines';
  app.innerHTML = `<section class="intro"><div class="intro-copy"><span class="eyebrow">A little movement, throughout your day</span><h1>Your routines.<br>Your own pace.</h1><p>Choose what fits your day. Follow the movements in order, and stay within a comfortable range.</p><a class="primary" href="#routines">Find a routine <span aria-hidden="true">↓</span></a></div><div class="intro-aside"><span class="large-mark" aria-hidden="true">g.</span><p>Daily care / Court / Gym</p><span>11 routines · 37 exercises</span></div></section>
    <section id="routines" aria-labelledby="routine-heading"><div class="section-heading"><h2 id="routine-heading">What’s the occasion?</h2><span>Make room for movement.</span></div>
    <div class="filters" role="group" aria-label="Filter routines">${Object.entries(categories).map(([key, label]) => `<button type="button" data-category="${key}" aria-pressed="${category === key}">${label}</button>`).join('')}</div>
    <div id="routine-list">${routineList()}</div></section>
    <aside class="safety-note"><h2>Keep it comfortable.</h2><p>${safety}</p></aside>`;
  status.textContent = `${categories[category]}. ${app.querySelectorAll('.routine').length} routines.`;
}

function exerciseView(item, number) {
  const exercise = exercises[item.id];
  const review = requiresReview(exercise, item);
  const condition = item.condition || exercise.condition;
  const caution = review ? 'Clinician approval required · skip until individually cleared.' : condition === 'tennis' ? 'Only if tennis is medically cleared.' : condition === 'gym' ? 'Approved lifts only · no restricted weights.' : '';
  // The source uses a few emphasis markers; render the words without exposing markup.
  const prose = value => esc(value.replace(/\*\*/g, '').replace(/\*([^*]+)\*/g, '$1'));
  const instructions = `<p class="how">${prose(exercise.how)}</p>${item.note ? `<p class="item-note">${esc(item.note)}</p>` : ''}<p class="take-care"><strong>Take care</strong> ${esc(exercise.watch)}</p><dl class="exercise-facts"><div><dt>Equipment</dt><dd>${esc(exercise.equipment || 'None')}</dd></div><div><dt>Alternative</dt><dd>${esc(exercise.alternatives)}</dd></div></dl>`;
  return `<article class="exercise" aria-labelledby="title-${number}">
    <div class="exercise-media">${image(exercise)}<a class="source" href="${esc(exercise.photo.source)}" ${external}>Original photo · ${esc(exercise.photo.publisher)} ↗</a>${exercise.photo.note ? `<p class="photo-note">${esc(exercise.photo.note)}</p>` : ''}</div>
    <div class="exercise-copy"><div class="step-heading"><span class="eyebrow">Movement ${String(number).padStart(2, '0')}</span><span class="dose">${esc(item.dose || exercise.defaultDose || 'As approved')}</span></div><h3 id="title-${number}">${esc(exercise.name)}</h3>
    ${caution ? `<p class="approval">${caution}</p>` : ''}${review ? `<details class="review-reference"><summary>View reference instructions</summary>${instructions}</details>` : instructions}</div>
  </article>`;
}

function detail(routine) {
  document.title = `${routine.title} · Good Move`;
  app.innerHTML = `<nav class="back-nav" aria-label="Routines"><a class="back" href="#">← All routines</a><span>${esc(categories[categoryFor(routine.group)])}</span></nav>
    <section class="routine-intro"><span class="eyebrow">${esc(routine.when)} / ${esc(routine.time)}</span><h1>${esc(routine.title)}</h1><p>${esc(routine.subtitle)}.</p><div class="routine-counts">${routine.core.length} main movements${routine.optional.length ? ` <span aria-hidden="true">/</span> ${routine.optional.length} optional extras` : ''}</div></section>
    <aside class="routine-safety"><strong>Before you start</strong><p>Follow in order. Skip any movement that causes symptoms or has not been approved for you.${routine.safety ? ` ${esc(routine.safety)}` : ''}</p></aside>
    <section aria-labelledby="movements-heading"><div class="section-heading"><h2 id="movements-heading">Your routine</h2><span>Slow, comfortable, controlled.</span></div><div class="exercise-list">${routine.core.map((item, index) => exerciseView(item, index + 1)).join('')}</div></section>
    ${routine.optional.length ? `<details class="extras"><summary>Optional extras <span>${routine.optional.length} movements</span></summary><p>Only add these if they feel helpful today. They are not essential.</p>${routine.optional.map((item, index) => exerciseView(item, routine.core.length + index + 1)).join('')}</details>` : ''}
    <div class="finish"><p>That’s your routine.</p><a class="primary" href="#">Back to all routines <span aria-hidden="true">↗</span></a></div>`;
  status.textContent = `${routine.title}. ${routine.core.length} main movements.`;
}

function route(focus = true) {
  const routine = parseRoute(location.hash, data.routines);
  if (routine) detail(routine);
  else home();
  if (focus) app.focus({ preventScroll: true });
  if (location.hash === '#routines') document.querySelector('#routines').scrollIntoView();
  else window.scrollTo({ top: routine ? 0 : homeScroll, behavior: 'instant' });
}

app.addEventListener('click', event => {
  const filter = event.target.closest('[data-category]');
  if (filter) {
    category = filter.dataset.category;
    app.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button === filter)));
    document.querySelector('#routine-list').innerHTML = routineList();
    status.textContent = `${app.querySelectorAll('.routine').length} routines. ${categories[category]}.`;
  }
  if (event.target.closest('.routine')) homeScroll = window.scrollY;
});
// Capture image failures, including failures inside the optional details section.
app.addEventListener('error', event => {
  if (event.target instanceof HTMLImageElement) event.target.closest('.photo')?.classList.add('failed');
}, true);

try {
  const response = await fetch(new URL('./data.json', import.meta.url));
  if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
  data = await response.json();
  exercises = Object.fromEntries(data.exercises.map(exercise => [exercise.id, exercise]));
  route(false);
  window.addEventListener('hashchange', () => route());
} catch (error) {
  console.error(error);
  app.innerHTML = '<section class="load-error"><h1>Routines couldn’t load.</h1><p>Check your connection and try again.</p><a class="primary" href="">Reload routines ↻</a></section>';
}
