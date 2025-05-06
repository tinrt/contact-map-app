let map = L.map('map').setView([40.75, -74.0], 4); 

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let markers = [];


document.addEventListener('DOMContentLoaded', () => {
  const rows = document.querySelectorAll("tbody tr");
  rows.forEach(row => {
    const lat = parseFloat(row.dataset.lat);
    const lng = parseFloat(row.dataset.lng);
    const name = row.children[0].innerText;

    if (!isNaN(lat) && !isNaN(lng)) {
      const marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>${name}</b>`);
      markers.push(marker);
    }
  });


  document.getElementById('firstSearch').addEventListener('input', filterContacts);
  document.getElementById('lastSearch').addEventListener('input', filterContacts);
  document.getElementById('searchBtn').addEventListener('click', filterContacts);
});

function onRowClick(e) {
  const tr = e.target.closest("tr");
  const lat = parseFloat(tr.dataset.lat);
  const lng = parseFloat(tr.dataset.lng);

  if (!isNaN(lat) && !isNaN(lng)) {
    map.flyTo([lat, lng], 13);
  }
}

function filterContacts() {
  const firstQuery = document.getElementById('firstSearch').value.toLowerCase();
  const lastQuery = document.getElementById('lastSearch').value.toLowerCase();

  document.querySelectorAll("tbody tr").forEach(row => {
    const nameText = row.children[0].innerText.toLowerCase();
    const [title, firstName, ...lastNameParts] = nameText.split(' ');
    const lastName = lastNameParts.join(' ');

    const matchesFirst = firstName.includes(firstQuery);
    const matchesLast = lastName.includes(lastQuery);

    row.style.display = (matchesFirst && matchesLast) ? '' : 'none';
  });
}
