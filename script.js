// Theme toggle + persistence
(function() {
  const KEY = 'lrh-theme'; // localStorage key
  const toggleBtnId = 'theme-toggle';

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      const btn = document.getElementById(toggleBtnId);
      if (btn) btn.textContent = '☀️';
      document.documentElement.setAttribute('aria-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      const btn = document.getElementById(toggleBtnId);
      if (btn) btn.textContent = '🌙';
      document.documentElement.setAttribute('aria-theme', 'light');
    }
  }

  function getPreferredTheme() {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;
    // fallback to system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  document.addEventListener('DOMContentLoaded', function () {
    // apply initial theme
    applyTheme(getPreferredTheme());

    // setup toggle button
    const btn = document.getElementById(toggleBtnId);
    if (btn) {
      btn.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem(KEY, next);
        applyTheme(next);
      });
    }
  });

  // react to system changes if user hasn't chosen explicitly
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const saved = localStorage.getItem(KEY);
    if (!saved) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
})();

// --- Crime data and search (existing functionality) ---
const crimeData = {
    "theft": {
        definition: "Taking someone else's property without permission.",
        section: "IPC Section 378",
        punishment: "Up to 3 years imprisonment or fine or both.",
        bailable: "Bailable",
    },
    "murder": {
        definition: "Intentional killing of a person.",
        section: "IPC Section 302",
        punishment: "Death penalty or life imprisonment.",
        bailable: "Non-Bailable",
    },
    "fraud": {
        definition: "Deception intended to result in financial or personal gain.",
        section: "IPC Section 420",
        punishment: "Up to 7 years imprisonment and fine.",
        bailable: "Non-Bailable",
    }
};

function searchCrime() {
    let crimeInput = document.getElementById("crimeInput");
    if (!crimeInput) return;
    let crime = crimeInput.value.trim().toLowerCase();
    let resultBox = document.getElementById("result");

    if (!resultBox) {
        resultBox = document.createElement('div');
        resultBox.id = 'result';
        document.body.appendChild(resultBox);
    }

    if (!crime) {
        resultBox.innerHTML = '<p style="color:var(--muted);">Please enter a crime name.</p>';
        return;
    }

    if (crimeData[crime]) {
        let data = crimeData[crime];
        resultBox.innerHTML = `
            <h2 style="margin-top:0;">${crime.toUpperCase()}</h2>
            <p><b>Definition:</b> ${data.definition}</p>
            <p><b>IPC Section:</b> ${data.section}</p>
            <p><b>Punishment:</b> ${data.punishment}</p>
            <p><b>Bailable:</b> ${data.bailable}</p>
        `;
    } else {
        resultBox.innerHTML = `<p style="color:red;">No data found for this crime.</p>`;
    }
}