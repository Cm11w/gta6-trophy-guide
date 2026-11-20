// Leonida Trophy Guide: checklist, filters, spoiler setting, export/import, roadmap.
// Loads app/data/trophies.json at run time (a file of this app, never the network) and keeps
// progress in localStorage. No external request is ever made.
const STORAGE_KEY = 'gta6-trophy-guide-v1';
const DEMO_EARNED_IDS = [2, 3, 4, 5, 8, 16, 20, 21, 35, 42, 51, 53];

const listEl = document.getElementById('list');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const statusEl = document.getElementById('status');
const spoilersEl = document.getElementById('spoilers');
const progressText = document.getElementById('progressText');
const progressPct = document.getElementById('progressPct');
const progressFill = document.getElementById('progressFill');
const gradeCountsEl = document.getElementById('gradeCounts');
const missableCallout = document.getElementById('missableCallout');
const resultCount = document.getElementById('resultCount');
const roadmapEl = document.getElementById('roadmap');
const viewChecklist = document.getElementById('viewChecklist');
const viewRoadmap = document.getElementById('viewRoadmap');
const tabChecklist = document.getElementById('tabChecklist');
const tabRoadmap = document.getElementById('tabRoadmap');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const byName = new Map(trophies.map((t) => [t.name, t]));

let saved = loadSavedState();
let earned = new Set(saved.earned.filter((name) => byName.has(name)));
let hideSpoilers = saved.hideSpoilers;
let openDetailId = null;

function loadSavedState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return {
      earned: Array.isArray(raw.earned) ? raw.earned : [],
      hideSpoilers: raw.hideSpoilers !== false,
    };
  } catch {
    return { earned: [], hideSpoilers: true };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ earned: [...earned], hideSpoilers }));
}

function applyUrlParams() {
  const params = new URLSearchParams(location.search);
  if (params.get('view') === 'roadmap') showRoadmapView();
  if (params.get('kind')) kindEl.value = params.get('kind');
  if (params.get('grade')) gradeEl.value = params.get('grade');
  if (params.get('q')) searchEl.value = params.get('q');
  if (params.get('spoilers') === 'off') hideSpoilers = false;
  if (params.get('spoilers') === 'on') hideSpoilers = true;
  if (params.get('demo') === '1' && earned.size === 0) {
    for (const id of DEMO_EARNED_IDS) earned.add(byId.get(id).name);
    saveState();
  }
  const trophyParam = Number(params.get('trophy'));
  if (byId.has(trophyParam)) openDetailId = trophyParam;
}

function spoilerHidden(trophy) {
  return hideSpoilers && trophy.spoiler && !earned.has(trophy.name);
}

function trophyMatchesFilters(trophy) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (kindEl.value === 'missable') {
    if (!trophy.missable) return false;
  } else if (kindEl.value !== 'all' && trophy.kind !== kindEl.value) {
    return false;
  }
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (statusEl.value === 'earned' && !earned.has(trophy.name)) return false;
  if (statusEl.value === 'todo' && earned.has(trophy.name)) return false;
  return true;
}

function gradeLabel(trophy) {
  return trophy.grade;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = Math.round((done / total) * 100);
  progressText.textContent = `${done} of ${total} earned`;
  progressPct.textContent = `${pct}%`;
  progressFill.style.width = `${pct}%`;
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const inGrade = trophies.filter((t) => t.grade === g);
    const got = inGrade.filter((t) => earned.has(t.name)).length;
    return `${got}/${inGrade.length} ${g}`;
  });
  gradeCountsEl.textContent = counts.join(' · ');
  const missable = trophies.find((t) => t.missable);
  if (missable && !earned.has(missable.name)) {
    missableCallout.innerHTML = '';
    const strong = document.createElement('strong');
    strong.textContent = 'Missable warning: ';
    missableCallout.append(strong, `do the Chapter 1 meditation for “${missable.name}” before Chapter 1 ends — it is the list's only possibly missable trophy.`);
  } else {
    missableCallout.textContent = '';
  }
}

function buildDetail(trophy) {
  const detail = document.createElement('div');
  detail.className = 'detail';
  const heading = document.createElement('h3');
  heading.textContent = 'Guide';
  detail.append(heading);
  if (trophy.missable && trophy.missable_note) {
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.textContent = trophy.missable_note;
    detail.append(warn);
  }
  const guide = document.createElement('p');
  guide.textContent = trophy.guide;
  detail.append(guide);
  const sources = document.createElement('div');
  sources.className = 'sources';
  sources.textContent = 'Sources:';
  const ul = document.createElement('ul');
  for (const s of trophy.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = s.name;
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    li.append(a);
    ul.append(li);
  }
  sources.append(ul);
  detail.append(sources);
  return detail;
}

function renderChecklist() {
  listEl.replaceChildren();
  const shown = trophies.filter(trophyMatchesFilters);
  resultCount.textContent = `Showing ${shown.length} of ${trophies.length} trophies`;
  if (shown.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'No trophies match these filters.';
    listEl.append(empty);
    return;
  }
  for (const trophy of shown) {
    const li = document.createElement('li');
    li.className = 'trophy';
    if (earned.has(trophy.name)) li.classList.add('earned');
    if (trophy.missable) li.classList.add('missable-flag');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.name);
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(trophy.name);
      else earned.delete(trophy.name);
      saveState();
      renderProgress();
      renderChecklist();
      renderRoadmap();
    });
    li.append(box);

    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'name';
    const desc = document.createElement('div');
    desc.className = 'desc';
    if (spoilerHidden(trophy)) {
      name.textContent = 'Hidden story trophy';
      desc.textContent = 'Hidden on PlayStation until earned.';
    } else {
      name.textContent = trophy.name;
      desc.textContent = trophy.description;
    }
    body.append(name, desc);
    li.append(body);

    const grade = document.createElement('span');
    grade.className = `grade grade-${trophy.grade}`;
    grade.textContent = gradeLabel(trophy);
    li.append(grade);

    const meta = document.createElement('div');
    meta.className = 'meta';
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = trophy.kind;
    meta.append(kindTag);
    if (trophy.missable) {
      const miss = document.createElement('span');
      miss.className = 'tag miss';
      miss.textContent = 'Missable';
      meta.append(miss);
    }
    if (trophy.hidden) {
      const hid = document.createElement('span');
      hid.className = 'tag hidden-tag';
      hid.textContent = 'Hidden on PSN';
      meta.append(hid);
    }
    const stageTag = document.createElement('span');
    stageTag.className = 'tag';
    stageTag.textContent = `Roadmap stage ${trophy.stage}`;
    meta.append(stageTag);
    li.append(meta);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'guide-btn';
    btn.textContent = openDetailId === trophy.id ? 'Hide guide' : 'Show guide';
    btn.addEventListener('click', () => {
      openDetailId = openDetailId === trophy.id ? null : trophy.id;
      renderChecklist();
    });
    li.append(btn);

    if (openDetailId === trophy.id) {
      if (spoilerHidden(trophy)) {
        const note = document.createElement('div');
        note.className = 'detail';
        const p = document.createElement('p');
        p.className = 'spoiler-note';
        p.textContent = 'This story trophy is hidden until you earn it — tick it off, or turn “Hide story spoilers” off, to read its guide.';
        note.append(p);
        li.append(note);
      } else {
        li.append(buildDetail(trophy));
      }
    }
    listEl.append(li);
  }
}

function renderRoadmap() {
  roadmapEl.replaceChildren();
  for (const stage of doc.roadmap) {
    const card = document.createElement('section');
    card.className = 'roadmap-stage';
    const h = document.createElement('h2');
    const num = document.createElement('span');
    num.className = 'num';
    num.textContent = `Stage ${stage.stage}`;
    h.append(num, document.createTextNode(stage.title));
    card.append(h);
    const hours = document.createElement('p');
    hours.className = 'hours';
    hours.textContent = stage.hours;
    card.append(hours);
    const text = document.createElement('p');
    text.textContent = stage.text;
    card.append(text);
    const ul = document.createElement('ul');
    for (const id of stage.trophies) {
      const trophy = byId.get(id);
      const li = document.createElement('li');
      const mark = document.createElement('span');
      const isDone = earned.has(trophy.name);
      mark.className = isDone ? 'done' : 'todo';
      mark.textContent = isDone ? '✓' : '○';
      const g = document.createElement('span');
      g.className = `g ${trophy.grade}`;
      g.textContent = trophy.grade;
      const n = document.createElement('span');
      n.textContent = spoilerHidden(trophy) ? 'Hidden story trophy' : trophy.name;
      li.append(mark, g, n);
      if (trophy.missable) {
        const miss = document.createElement('span');
        miss.className = 'tag miss';
        miss.textContent = 'Missable';
        li.append(miss);
      }
      ul.append(li);
    }
    card.append(ul);
    roadmapEl.append(card);
  }
}

function showChecklistView() {
  viewChecklist.hidden = false;
  viewRoadmap.hidden = true;
  tabChecklist.classList.add('active');
  tabRoadmap.classList.remove('active');
}

function showRoadmapView() {
  viewChecklist.hidden = true;
  viewRoadmap.hidden = false;
  tabRoadmap.classList.add('active');
  tabChecklist.classList.remove('active');
}

function exportProgress() {
  const payload = {
    game: 'Grand Theft Auto VI',
    exported: new Date().toISOString(),
    earned: [...earned],
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  const names = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(names)) throw new Error('not a progress file');
  earned = new Set(names.filter((name) => byName.has(name)));
  saveState();
  renderProgress();
  renderChecklist();
  renderRoadmap();
}

document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    await importProgress(file);
  } catch {
    alert('That file is not a trophy-progress export from this guide.');
  }
  event.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned ticks?')) return;
  earned = new Set();
  saveState();
  renderProgress();
  renderChecklist();
  renderRoadmap();
});
searchEl.addEventListener('input', renderChecklist);
kindEl.addEventListener('change', renderChecklist);
gradeEl.addEventListener('change', renderChecklist);
statusEl.addEventListener('change', renderChecklist);
spoilersEl.addEventListener('change', () => {
  hideSpoilers = spoilersEl.checked;
  saveState();
  renderChecklist();
  renderRoadmap();
});
tabChecklist.addEventListener('click', showChecklistView);
tabRoadmap.addEventListener('click', showRoadmapView);

applyUrlParams();
spoilersEl.checked = hideSpoilers;
renderProgress();
renderChecklist();
renderRoadmap();
