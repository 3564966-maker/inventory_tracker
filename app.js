// State initialisation
const DEFAULT_STATE = {
  drawerBalance: 0,
  inventory: { tobacco: 0, rollingPaper: 0, filters: 0, lighters: 0 },
  history: []
};

let state = JSON.parse(localStorage.getItem('inventory_app_data')) || DEFAULT_STATE;

function saveState() {
  localStorage.setItem('inventory_app_data', JSON.stringify(state));
  render();
}

// UI Render
function render() {
  document.getElementById('drawer-balance').innerText = `$${state.drawerBalance.toFixed(2)}`;
  
  for (const item in state.inventory) {
    const el = document.getElementById(`stock-${item}`);
    if (el) el.innerText = state.inventory[item];
  }

  const historyList = document.getElementById('history-list');
  historyList.innerHTML = state.history.map(entry => `
    <li>
      <strong>${entry.date} - ${entry.type.toUpperCase()}</strong>: 
      ${entry.details} (${entry.amount >= 0 ? '+' : ''}$${entry.amount.toFixed(2)})
    </li>
  `).reverse().join('');
}

// Action Processing
document.getElementById('submit-action-btn').addEventListener('click', () => {
  const type = document.getElementById('action-type').value;
  const item = document.getElementById('action-item').value;
  const qty = parseInt(document.getElementById('action-qty').value) || 0;
  const amount = parseFloat(document.getElementById('action-amount').value) || 0;
  const date = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let netCashChange = 0;
  let details = '';

  if (type === 'invest') {
    netCashChange = amount;
    details = `Invested cash`;
  } else if (type === 'borrow') {
    netCashChange = -amount;
    details = `Borrowed cash`;
  } else if (type === 'buy') {
    netCashChange = -amount;
    state.inventory[item] += qty;
    details = `Bought ${qty}x ${item}`;
  } else if (type === 'sell') {
    netCashChange = amount;
    state.inventory[item] -= qty;
    details = `Sold ${qty}x ${item}`;
  }

  state.drawerBalance += netCashChange;
  state.history.push({ date, type, details, amount: netCashChange });

  saveState();
  document.getElementById('modal').classList.add('hidden');
});

// Modal toggle controls
document.getElementById('open-modal-btn').onclick = () => document.getElementById('modal').classList.remove('hidden');
document.getElementById('close-modal-btn').onclick = () => document.getElementById('modal').classList.add('hidden');

// Initial render call
render();