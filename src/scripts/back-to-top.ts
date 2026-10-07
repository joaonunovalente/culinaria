/** Smooth "back to top" for `[data-back-to-top]` links. */
document.querySelector("[data-back-to-top]")?.addEventListener("click", (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
