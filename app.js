const PAGE_SIZE = 6;
let shirts = [];
let page = 1;

function itemUrl(id) {
  return `item.html?id=${id}`;
}

function renderGrid() {
  const grid = document.getElementById('shirt-grid');
  const start = (page - 1) * PAGE_SIZE;
  const pageShirts = shirts.slice(start, start + PAGE_SIZE);

  grid.innerHTML = pageShirts.map(shirt => {
    const badge = shirt.available
      ? '<span class="badge-available">Available</span>'
      : '<span class="badge-claimed">Claimed</span>';

    return `
      <div class="shirt-card">
        <a href="${itemUrl(shirt.id)}">
          <img src="${shirt.images.front}" alt="${shirt.title}"
               onerror="this.outerHTML='<div style=&quot;height:140px;display:flex;align-items:center;justify-content:center;border:2px inset #808080&quot;>[No Image]</div>'">
        </a>
        <a href="${itemUrl(shirt.id)}">${shirt.title}</a>
        <div>${shirt.size} &mdash; ${shirt.brand}</div>
        <div>${badge}</div>
      </div>`;
  }).join('');
}

function renderPagination() {
  const totalPages = Math.ceil(shirts.length / PAGE_SIZE);
  const pagination = document.getElementById('pagination');

  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  pagination.innerHTML = `
    <a href="#" id="prev">Previous</a>
    <span>Page ${page} of ${totalPages}</span>
    <a href="#" id="next">Next</a>`;

  document.getElementById('prev').addEventListener('click', e => {
    e.preventDefault();
    if (page > 1) { page--; render(); }
  });

  document.getElementById('next').addEventListener('click', e => {
    e.preventDefault();
    if (page < totalPages) { page++; render(); }
  });
}

function render() {
  renderGrid();
  renderPagination();
}

fetch('data.json')
  .then(r => r.json())
  .then(data => {
    shirts = data.shirts;
    render();
  });
