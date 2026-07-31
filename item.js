const id = new URLSearchParams(location.search).get('id');
const detail = document.getElementById('item-detail');

function showNotFound() {
  detail.innerHTML = '<p>Shirt not found. <a href="index.html">Back to listings</a></p>';
}

function renderClaimForm() {
  return `
    <form class="claim-form" id="claim-form">
      <p><strong>How would you like to receive this shirt?</strong></p>
      <label><input type="radio" name="method" value="ship" required> Ship to me</label><br>
      <label><input type="radio" name="method" value="pickup"> Local pickup</label>

      <div id="form-fields" style="margin-top:10px;">
        <p><label>Name<br><input type="text" name="name"></label></p>
        <p><label>Email<br><input type="email" name="email"></label></p>
        <p id="address-field" style="display:none;">
          <label>Mailing Address<br><textarea name="address" rows="3"></textarea></label>
        </p>
      </div>

      <p>
        <label>
          <input type="checkbox" name="confirm">
          I understand Casey will reach out to confirm
        </label>
      </p>

      <button type="submit">Claim This Shirt</button>
    </form>`;
}

function attachFormLogic() {
  const form = document.getElementById('claim-form');
  const addressField = document.getElementById('address-field');
  const radios = form.querySelectorAll('input[name="method"]');

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      addressField.style.display = radio.value === 'ship' ? 'block' : 'none';
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const method = data.get('method');
    const name = data.get('name').trim();
    const email = data.get('email').trim();
    const address = data.get('address') ? data.get('address').trim() : '';
    const confirmed = data.get('confirm');

    if (!method || !name || !email || (method === 'ship' && !address) || !confirmed) {
      alert('Please fill out all fields and check the confirmation box.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    fetch('https://formspree.io/f/xlgqkqap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name, email, method, address, shirt: document.title })
    })
      .then(r => r.json())
      .then(res => {
        if (res.ok) {
          form.outerHTML = '<p><strong>Your claim has been submitted! Casey will be in touch soon.</strong></p>';
        } else {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Claim This Shirt';
          alert('Something went wrong. Please try again.');
        }
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Claim This Shirt';
        alert('Something went wrong. Please try again.');
      });
  });
}

function renderShirt(shirt) {
  const badge = shirt.available
    ? '<span class="badge-available">Available</span>'
    : '<span class="badge-claimed">Claimed</span>';

  const backImg = shirt.images.back
    ? `<img src="${shirt.images.back}" alt="${shirt.title} back"
            onerror="this.style.display='none'">`
    : '';

  const claimSection = shirt.available
    ? renderClaimForm()
    : '<p class="badge-claimed">This shirt has been claimed.</p>';

  document.title = shirt.title;

  detail.innerHTML = `
    <div>
      <img src="${shirt.images.front}" alt="${shirt.title} front"
           onerror="this.outerHTML='<div style=&quot;width:220px;height:280px;display:flex;align-items:center;justify-content:center;border:2px inset #808080&quot;>[No Image]</div>'">
      ${backImg}
    </div>
    <div>
      <h2>${shirt.title}</h2>
      <p>${badge}</p>
      <p><strong>Brand:</strong> ${shirt.brand}</p>
      <p><strong>Size:</strong> ${shirt.size}</p>
      <p>${shirt.description}</p>
      ${claimSection}
    </div>`;

  if (shirt.available) attachFormLogic();
}

if (!id) {
  showNotFound();
} else {
  fetch('data.json')
    .then(r => r.json())
    .then(data => {
      const shirt = data.shirts.find(s => s.id === id);
      shirt ? renderShirt(shirt) : showNotFound();
    });
}
