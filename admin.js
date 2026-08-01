const OWNER = 'caseyokane';
const REPO = 'casey-shirt-catalog';
const FILE = 'data.json';

let pat = '';
let fileSha = '';
let shirts = [];

function setStatus(msg, isError = false) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.style.color = isError ? '#cc0000' : '#008000';
}

async function load() {
  pat = document.getElementById('pat-input').value.trim();
  if (!pat) return setStatus('Enter a Personal Access Token.', true);
  sessionStorage.setItem('gh_pat', pat);

  try {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`, {
      headers: { Authorization: `Bearer ${pat}`, Accept: 'application/vnd.github+json' }
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const file = await res.json();
    fileSha = file.sha;
    shirts = JSON.parse(atob(file.content.replace(/\s/g, ''))).shirts;
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-section').style.display = 'block';
    renderShirts();
  } catch (err) {
    setStatus(`Load failed: ${err.message}`, true);
  }
}

async function commitChanges() {
  shirts = collect();
  const json = JSON.stringify({ shirts }, null, 2);
  const encoded = btoa(unescape(encodeURIComponent(json)));

  try {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Update shirt catalog via admin', content: encoded, sha: fileSha })
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const result = await res.json();
    fileSha = result.content.sha;
    setStatus('Saved! GitHub Pages will redeploy in ~30 seconds.');
  } catch (err) {
    setStatus(`Save failed: ${err.message}`, true);
  }
}

function nextId() {
  const max = shirts.reduce((m, s) => Math.max(m, parseInt(s.id, 10)), 0);
  return String(max + 1).padStart(3, '0');
}

function addShirt() {
  shirts = collect();
  shirts.push({ id: nextId(), title: '', description: '', size: '', brand: '', images: { front: '', back: '' }, available: true });
  renderShirts();
  document.getElementById('shirt-list').lastElementChild.scrollIntoView();
}

function removeShirt(index) {
  if (!confirm('Remove this shirt?')) return;
  shirts = collect();
  shirts.splice(index, 1);
  renderShirts();
}

function collect() {
  return Array.from(document.querySelectorAll('#shirt-list fieldset')).map(fs => {
    const front = fs.querySelector('[name="front"]').value.trim();
    const back = fs.querySelector('[name="back"]').value.trim();
    const images = { front };
    if (back) images.back = back;
    return {
      id: fs.querySelector('[name="id"]').value,
      title: fs.querySelector('[name="title"]').value.trim(),
      description: fs.querySelector('[name="description"]').value.trim(),
      size: fs.querySelector('[name="size"]').value.trim(),
      brand: fs.querySelector('[name="brand"]').value.trim(),
      images,
      available: fs.querySelector('[name="available"]').checked
    };
  });
}

function shirtFieldset(shirt, index) {
  const back = shirt.images.back || '';
  const checked = shirt.available ? 'checked' : '';
  return `
    <fieldset>
      <legend>${shirt.id} &mdash; ${shirt.title || 'New Shirt'}
        <button type="button" onclick="removeShirt(${index})">Remove</button>
      </legend>
      <input type="hidden" name="id" value="${shirt.id}">
      <p><label>Title<br><input type="text" name="title" value="${shirt.title}"></label></p>
      <p><label>Description<br><textarea name="description" rows="2">${shirt.description}</textarea></label></p>
      <p><label>Size<br><input type="text" name="size" value="${shirt.size}"></label></p>
      <p><label>Brand<br><input type="text" name="brand" value="${shirt.brand}"></label></p>
      <p><label>Front Image Path<br><input type="text" name="front" value="${shirt.images.front}"></label></p>
      <p><label>Back Image Path (optional)<br><input type="text" name="back" value="${back}"></label></p>
      <p><label><input type="checkbox" name="available" ${checked}> Available</label></p>
    </fieldset>`;
}

function renderShirts() {
  document.getElementById('shirt-list').innerHTML = shirts.map(shirtFieldset).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('gh_pat');
  if (saved) document.getElementById('pat-input').value = saved;
});
