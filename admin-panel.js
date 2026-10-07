(() => {
  const panel = document.createElement('section');
  panel.hidden = true;
  panel.dir = 'rtl';
  panel.className = 'card';
  panel.style.cssText = 'margin:16px;padding:20px;position:relative;z-index:20';
  panel.innerHTML = `<details><summary style="cursor:pointer;font-weight:bold">مدیریت کاربران و رمز عبور</summary>
    <p>نام کاربری جدید: ساخت حساب؛ نام کاربری موجود: جایگزینی رمز همان حساب.</p>
    <form autocomplete="off">
      <label>نام کاربری <input name="username" required pattern="[a-z0-9._-]{3,40}" minlength="3" maxlength="40" dir="ltr" autocomplete="off"></label>
      <label>رمز جدید <input name="password" type="password" required minlength="6" maxlength="128" autocomplete="new-password" dir="ltr"></label>
      <label>تکرار رمز <input name="confirmation" type="password" required minlength="6" maxlength="128" autocomplete="new-password" dir="ltr"></label>
      <p>نام کاربری: ۳ تا ۴۰ حرف کوچک انگلیسی، عدد، نقطه، خط تیره یا زیرخط.</p>
      <label><input name="acknowledge" type="checkbox" required> اگر کاربر وجود دارد، رمز او جایگزین شود.</label>
      <button type="submit" class="btn btn-primary">ساخت کاربر / تعیین رمز</button>
      <p role="status" aria-live="polite"></p>
    </form></details>`;
  document.body.prepend(panel);
  const form = panel.querySelector('form');
  const status = panel.querySelector('[role="status"]');
  const submit = panel.querySelector('[type="submit"]');
  const updateVisibility = () => {
    panel.hidden = !cloudUser || cloudUser.email !== 'admin@internal.local';
    if (panel.hidden) { form.reset(); status.textContent = ''; }
  };
  updateVisibility();
  setInterval(updateVisibility, 1000);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submit.disabled || panel.hidden || !form.reportValidity()) return;
    const username = form.elements.username.value.trim();
    const password = form.elements.password.value;
    if (password !== form.elements.confirmation.value) {
      status.textContent = 'رمز و تکرار آن یکسان نیستند.';
      return;
    }
    submit.disabled = true;
    status.textContent = 'در حال ارسال درخواست…';
    try {
      const { data, error } = await supabaseClient.functions.invoke('admin-users', { body: { username, password } });
      if (error || !data?.ok) throw new Error('request_failed');
      status.textContent = `حساب «${username}» آماده است؛ کاربر با همین نام و رمز تعیین‌شده وارد شود.`;
      form.reset();
    } catch {
      status.textContent = 'درخواست تأیید نشد. اتصال اینترنت، ورود مدیر و انتشار تابع admin-users را بررسی کنید؛ تغییر رمز را موفق فرض نکنید.';
    } finally {
      form.elements.password.value = '';
      form.elements.confirmation.value = '';
      submit.disabled = false;
    }
  });
})();
