document.getElementById('year').textContent = new Date().getFullYear();

function wireContactForm(form, { messagePrefix } = {}) {
  const statusEl = form.querySelector('.form-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    const data = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      restaurant: form.restaurant.value,
      message: messagePrefix ? messagePrefix + form.message.value : form.message.value,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok && result.ok) {
        statusEl.textContent = "Thanks! We'll be in touch soon.";
        statusEl.classList.add('success');
        form.reset();
      } else {
        statusEl.textContent = result.error || 'Something went wrong. Please try again.';
        statusEl.classList.add('error');
      }
    } catch (err) {
      statusEl.textContent = 'Something went wrong. Please try again.';
      statusEl.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
}

const contactForm = document.getElementById('contact-form');
if (contactForm) wireContactForm(contactForm);

const customRequestForm = document.getElementById('custom-request-form');
if (customRequestForm) wireContactForm(customRequestForm, { messagePrefix: 'Custom request: ' });
