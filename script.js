// Student-style Crime Lookup Script
// File: simplified_crime_app_student.js
// This version is written in a simple, easy-to-understand way with friendly comments

(function(){
  'use strict';

  // ----- Configuration -----
  // The URL where the crime JSON is hosted. Change to a local URL if you're testing locally.
  const CRIMES_API = 'https://paparx.github.io/Crime_punishment/crime.json';

  // ID names used in the HTML
  const INPUT_ID = 'crimeInput';
  const RESULT_ID = 'result';
  const THEME_TOGGLE_ID = 'theme-toggle';

  // localStorage key for saving theme
  const THEME_KEY = 'lrh-theme';

  // timeout for fetch (milliseconds)
  const FETCH_TIMEOUT = 10000; // 10 seconds

  // ----- Small helper functions (made simple on purpose) -----

  // escape HTML so we don't accidentally show unsafe content
  function escapeHtml(s){
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // convert different true/false forms into 'Yes', 'No' or 'Unknown'
  function boolLabel(v){
    if (v === true || v === 'true' || v === 'yes') return 'Yes';
    if (v === false || v === 'false' || v === 'no') return 'No';
    return 'Unknown';
  }

  // tiny Levenshtein distance for fuzzy matching (works fine for small strings)
  function levenshtein(a,b){
    a = a || '';
    b = b || '';
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = [];
    for (let i=0;i<=m;i++){
      dp[i] = [];
      for (let j=0;j<=n;j++) dp[i][j] = 0;
    }
    for (let i=0;i<=m;i++) dp[i][0] = i;
    for (let j=0;j<=n;j++) dp[0][j] = j;
    for (let i=1;i<=m;i++){
      for (let j=1;j<=n;j++){
        const cost = a[i-1] === b[j-1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
      }
    }
    return dp[m][n];
  }

  // ----- Theme toggle (simple) -----
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('aria-theme', theme);
    const btn = document.getElementById(THEME_TOGGLE_ID);
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  function getSavedTheme(){
    const s = localStorage.getItem(THEME_KEY);
    if (s === 'dark' || s === 'light') return s;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  // ----- Crime data state -----
  // We'll store crimes in a simple object: { 'lowercase name': crimeObject }
  let crimeMap = null;

  // Fetch JSON with a timeout (simple version)
  async function fetchJson(url){
    const controller = new AbortController();
    const tm = setTimeout(()=> controller.abort(), FETCH_TIMEOUT);
    try{
      const resp = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(tm);
      if (!resp.ok) throw new Error(resp.status + ' ' + resp.statusText);
      return await resp.json();
    }catch(err){
      clearTimeout(tm);
      throw err;
    }
  }

  // Turn different payload shapes into an array we can work with
  function getArrayFromPayload(payload){
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (typeof payload === 'object'){
      if (Array.isArray(payload.crimes)) return payload.crimes;
      if (Array.isArray(payload.data)) return payload.data;
      // fallback: try to pick object values that look like crimes
      const values = Object.values(payload).filter(v => v && typeof v === 'object' && (v.name || v.section || v.description));
      if (values.length > 0) return values;
      // as last resort, return the object as a single item
      return [payload];
    }
    return [];
  }

  // Normalize a single crime item into a simpler format we expect
  function normalizeItem(item){
    const name = item.name || item.title || item.crime || item.key || (item.id ? ('crime-'+item.id) : 'Unknown');
    return {
      id: item.id || null,
      name: String(name).trim(),
      section: item.section || item.ipc || item.act || 'Not specified',
      punishment: item.punishment || item.penalty || 'Not specified',
      ingredients: item.ingredients || item.elements || item.details || null,
      cognizable: item.cognizable !== undefined ? item.cognizable : (item.isCognizable !== undefined ? item.isCognizable : null),
      bailable: item.bailable !== undefined ? item.bailable : (item.isBailable !== undefined ? item.isBailable : null),
      compoundable: item.compoundable !== undefined ? item.compoundable : (item.isCompoundable !== undefined ? item.isCompoundable : null),
      description: item.description || item.def || item.details || 'No description available.',
      original: item
    };
  }

  // Load data and fill crimeMap
  async function loadCrimeData(){
    if (crimeMap) return; // already loaded
    const box = document.getElementById(RESULT_ID);
    if (box) box.innerHTML = '<p style="color:var(--muted);">Loading crime data...</p>';
    try{
      const payload = await fetchJson(CRIMES_API);
      const arr = getArrayFromPayload(payload);
      crimeMap = {};
      arr.forEach(it => {
        const n = normalizeItem(it);
        if (n.name) crimeMap[n.name.toLowerCase()] = n;
      });
      populateDatalist();
      if (box) box.innerHTML = '';
    }catch(err){
      crimeMap = {};
      console.error('Load error', err);
      if (box) box.innerHTML = `<p style="color:red;">Failed to load crime data: ${escapeHtml(err.message)}</p>`;
    }
  }

  // Create datalist suggestions so users see possible crime names as they type
  function populateDatalist(){
    const input = document.getElementById(INPUT_ID);
    if (!input || !crimeMap) return;
    let dl = document.getElementById('crime-suggestions');
    if (!dl){
      dl = document.createElement('datalist');
      dl.id = 'crime-suggestions';
      document.body.appendChild(dl);
      input.setAttribute('list', dl.id);
    }
    const names = Object.values(crimeMap).map(c => c.name).filter(Boolean).sort((a,b)=>a.localeCompare(b));
    dl.innerHTML = names.slice(0,500).map(n => `<option value="${escapeHtml(n)}">`).join('');
  }

  // Render ingredients (array or comma-separated string) nicely
  function renderIngredients(ings){
    if (!ings) return '<em>Not specified</em>';
    if (Array.isArray(ings)){
      if (ings.length === 0) return '<em>Not specified</em>';
      return '<ul style="margin:6px 0 6px 18px;">' + ings.map(i => `<li>${escapeHtml(i)}</li>`).join('') + '</ul>';
    }
    if (typeof ings === 'string'){
      const parts = ings.split(/\r?\n|;|,/).map(s=>s.trim()).filter(Boolean);
      if (parts.length > 1) return '<ul style="margin:6px 0 6px 18px;">' + parts.map(i=>`<li>${escapeHtml(i)}</li>`).join('') + '</ul>';
      return `<p>${escapeHtml(ings)}</p>`;
    }
    return '<em>Not specified</em>';
  }

  // Render a crime into HTML
  function renderCrime(c){
    if (!c) return '<p style="color:red;">No data available.</p>';
    return `\n      <div class="crime-card" style="border-radius:8px;padding:14px;border:1px solid var(--muted);background:var(--surface);max-width:780px;">\n        <h2 style="margin:0 0 8px 0;">${escapeHtml(String(c.name || 'Unknown').toUpperCase())}</h2>\n        <p style="margin:4px 0;"><strong>IPC / Act Section:</strong> ${escapeHtml(c.section)}</p>\n        <p style="margin:4px 0;"><strong>Punishment:</strong> ${escapeHtml(c.punishment)}</p>\n        <p style="margin:6px 0;"><strong>Ingredients (elements to prove):</strong></p>\n        ${renderIngredients(c.ingredients)}\n        <p style="margin:6px 0;"><strong>Cognizable:</strong> ${escapeHtml(boolLabel(c.cognizable))}</p>\n        <p style="margin:6px 0;"><strong>Bailable:</strong> ${escapeHtml(boolLabel(c.bailable))}</p>\n        <p style="margin:6px 0;"><strong>Compoundable:</strong> ${escapeHtml(boolLabel(c.compoundable))}</p>\n        <p style="margin:6px 0;"><strong>Description:</strong> ${escapeHtml(c.description)}</p>\n      </div>\n    `;
  }

  // Main search function (simple and easy to follow)
  async function searchCrime(){
    const input = document.getElementById(INPUT_ID);
    if (!input) return;
    const raw = (input.value || '').trim();
    let resultBox = document.getElementById(RESULT_ID);
    if (!resultBox){
      resultBox = document.createElement('div');
      resultBox.id = RESULT_ID;
      input.insertAdjacentElement('afterend', resultBox);
    }

    if (!raw){
      resultBox.innerHTML = '<p style="color:var(--muted);">Please enter a crime name.</p>';
      return;
    }

    // load data if not loaded yet
    if (!crimeMap) await loadCrimeData();

    if (!crimeMap || Object.keys(crimeMap).length === 0){
      resultBox.innerHTML = `<p style="color:red;">Crime database is empty or failed to load. Check the API and CORS settings.</p>`;
      return;
    }

    const key = raw.toLowerCase();

    // 1) exact match
    let data = crimeMap[key];

    // 2) substring match
    if (!data){
      const vals = Object.values(crimeMap);
      data = vals.find(v => (v.name || '').toLowerCase().includes(key));
    }

    // 3) numeric id match
    if (!data){
      const asNum = Number(raw);
      if (!Number.isNaN(asNum)){
        data = Object.values(crimeMap).find(v => v.id === asNum || String(v.id) === String(asNum));
      }
    }

    // 4) fuzzy suggestions
    if (!data){
      const vals = Object.values(crimeMap);
      const cand = vals.map(v => ({v, d: levenshtein((v.name||'').toLowerCase(), key)})).sort((a,b)=>a.d-b.d).slice(0,6);
      if (cand.length > 0 && cand[0].d <= 3){
        data = cand[0].v;
      } else if (cand.length > 0){
        resultBox.innerHTML = '<p style="color:var(--muted);">No exact match found. Suggestions:</p>' +
          '<ul style="margin-left:18px;">' +
          cand.map(x => `<li style="margin:6px 0;"><button type=\"button\" style=\"background:none;border:0;color:var(--link);cursor:pointer;padding:0;text-decoration:underline\" onclick=\"selectSuggestion(\'${escapeHtml(String(x.v.name).replace(/'/g, "\\'"))}\')\">${escapeHtml(x.v.name)}</button></li>`).join('') +
          '</ul>';
        return;
      }
    }

    if (data){
      resultBox.innerHTML = renderCrime(data);
    } else {
      resultBox.innerHTML = `<p style="color:red;">No data found for "<b>${escapeHtml(raw)}</b>". Try different spellings.</p>`;
    }
  }

  // helper used by suggestion buttons
  function selectSuggestion(name){
    const input = document.getElementById(INPUT_ID);
    if (!input) return;
    input.value = name;
    // run search again
    searchCrime().catch(e => console.error(e));
  }

  // ----- Initialization -----
  document.addEventListener('DOMContentLoaded', function(){
    // apply theme
    applyTheme(getSavedTheme());

    // wire theme toggle (if present)
    const tbtn = document.getElementById(THEME_TOGGLE_ID);
    if (tbtn) tbtn.addEventListener('click', function(){
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = cur === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });

    // preload crime data but ignore errors here (they show in UI)
    loadCrimeData().catch(e => console.error('Preload failed', e));
  });

  // expose functions for inline use
  window.searchCrime = searchCrime;
  window.selectSuggestion = selectSuggestion;

})();