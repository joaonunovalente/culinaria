/**
 * "Mais receitas" progressive reveal. Every card is in the HTML; items past
 * the first batch carry `is-overflow` and CSS hides them once `is-paged`
 * is set here, so no-JS visitors still see the full list.
 */
(() => {
  const list = document.getElementById("recipe-list");
  const button = document.querySelector<HTMLButtonElement>("[data-load-more]");
  const status = document.querySelector("[data-load-more-status]");
  if (!list || !button || !status) return;

  const total = list.querySelectorAll(".c-dyn-item").length;
  const pending = [...list.querySelectorAll(".is-overflow")];
  const step = Number(button.dataset.step) || 3;

  if (!pending.length) {
    button.remove();
    return;
  }

  const reveal = (count: number) => {
    pending.splice(0, count).forEach((item) => item.classList.remove("is-overflow"));
    const shown = total - pending.length;
    status.textContent = `${shown} de ${total} receitas`;
    if (!pending.length) button.remove();
  };

  list.classList.add("is-paged");
  button.hidden = false;
  reveal(0);

  button.addEventListener("click", () => reveal(step));
})();
