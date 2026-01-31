/**
 * LEGAL RESOURCE HUB - CORE JAVASCRIPT
 * This script handles data fetching, search filtering, pagination, and modal interactions.
 * It is designed to be readable and easy to explain for educational purposes.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. GLOBAL VARIABLES ---
  const grid = document.getElementById('resultsGrid');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const searchInput = document.getElementById('searchInput');
  const typeChips = document.querySelectorAll('#typeFilters .filter-chip');
  const categoryChips = document.querySelectorAll('#categoryFilters .filter-chip');

  let allCrimes = [];        // Stores the full list from JSON
  let filteredList = [];     // Stores currently searched/filtered results
  let itemsShown = 0;        // Counter for pagination
  const PAGE_SIZE = 9;       // How many items to show at once

  // Stop script if not on the crime search page
  if (!grid) return;

  // --- 2. DATA LOADING ---
  fetch('./crime.json')
    .then(response => response.json())
    .then(data => {
      allCrimes = Array.isArray(data) ? data : (data.crimes || []);
      window.allCrimesData = allCrimes; // For global modal access
      applyFilters(); // Initial render
    })
    .catch(error => {
      console.error('Data Load Error:', error);
      grid.innerHTML = '<p class="center" style="color:red">Error: Could not load legal database.</p>';
    });

  // --- 3. FILTERING LOGIC ---
  function applyFilters() {
    const text = searchInput.value.toLowerCase();
    const activeType = document.querySelector('#typeFilters .filter-chip.active')?.dataset.filter || 'all';
    const activeCat = document.querySelector('#categoryFilters .filter-chip.active')?.dataset.cat || 'all';

    filteredList = allCrimes.filter(item => {
      // A. Search Text Match
      const textMatch = (item.name + item.section + (item.description || '')).toLowerCase().includes(text);
      if (!textMatch) return false;

      // B. Type Filter Match
      if (activeType !== 'all') {
        if (activeType === 'cognizable' && !item.cognizable) return false;
        if (activeType === 'bailable' && !item.bailable) return false;
        if (activeType === 'non-bailable' && item.bailable) return false;
        if (activeType === 'high-severity' && item.severity < 8) return false;
      }

      // C. Category Match
      if (activeCat !== 'all' && item.category !== activeCat) return false;

      return true;
    });

    itemsShown = PAGE_SIZE;
    renderResults();
  }

  // --- 4. UI RENDERING ---
  function renderResults() {
    grid.innerHTML = '';

    if (filteredList.length === 0) {
      grid.innerHTML = '<p class="msg-empty">No matching records found. Try adjusting your filters.</p>';
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    const visibleBatch = filteredList.slice(0, itemsShown);

    grid.innerHTML = visibleBatch.map(item => `
            <div class="crime-card" onclick="openModal(${item.id})">
                <span class="badge" style="background:var(--accent); color:white">${item.category || 'Law'}</span>
                <h3>${item.name}</h3>
                <p><strong>Section:</strong> ${item.section || 'N/A'}</p>
                <p style="font-size:0.9rem">${(item.description || '').substring(0, 75)}...</p>
                <div style="margin-top:10px; font-size:0.8rem; color:#888">Click to view details →</div>
            </div>
        `).join('');

    if (loadMoreBtn) {
      loadMoreBtn.style.display = (itemsShown >= filteredList.length) ? 'none' : 'block';
    }
  }

  // --- 5. EVENT LISTENERS ---
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  // Handle Type Chips
  typeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      typeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyFilters();
    });
  });

  // Handle Category Chips
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Multiple categories can't be active at once in this simple logic
      const wasActive = chip.classList.contains('active');
      categoryChips.forEach(c => c.classList.remove('active'));
      if (!wasActive) chip.classList.add('active');
      applyFilters();
    });
  });

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      itemsShown += PAGE_SIZE;
      renderResults();
    });
  }
});

// --- 6. MODAL INTERACTION (GLOBAL) ---
function openModal(id) {
  const modal = document.getElementById('crimeModal');
  if (!modal || !window.allCrimesData) return;

  const item = window.allCrimesData.find(c => c.id === id);
  if (!item) return;

  // Mapping item data to HTML IDs inside the modal
  document.getElementById('modalTitle').innerText = item.name;
  document.getElementById('modalSection').innerText = item.section || 'N/A';
  document.getElementById('modalDesc').innerText = item.description || 'No description available.';
  document.getElementById('modalPunishment').innerText = item.punishment || 'Consult legal experts.';
  document.getElementById('modalSeverity').innerText = (item.severity || '0') + '/10';
  document.getElementById('modalCognizable').innerText = item.cognizable ? 'Yes' : 'No';
  document.getElementById('modalBailable').innerText = item.bailable ? 'Yes' : 'No';
  document.getElementById('modalCompoundable').innerText = item.compoundable ? 'Yes' : 'No';

  const list = document.getElementById('modalIngredients');
  if (list) {
    list.innerHTML = (item.ingredients || []).map(ing => `<li>${ing}</li>`).join('');
    if (!item.ingredients || item.ingredients.length === 0) {
      list.innerHTML = '<li>N/A</li>';
    }
  }

  modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('crimeModal');
  if (modal) modal.classList.remove('open');
}

// Close on outside click
window.addEventListener('click', (e) => {
  const modal = document.getElementById('crimeModal');
  if (e.target === modal) closeModal();
});
