/**
 * Print just the `.print-area` inside a container.
 *
 * Radix dialogs render in portals with transforms, scroll clipping and
 * max-heights, which broke CSS-only printing (content scattered / cut off).
 * Instead we clone the area into a plain top-level container, hide the rest
 * of the page, print, then clean up — so the browser paginates normal flow.
 */
export function printArea(root?: HTMLElement | null) {
  // Dialogs render in portals appended at the end of <body>, so the last
  // match is the one currently on top.
  const areas = (root ?? document).querySelectorAll<HTMLElement>(".print-area");
  const source = areas.length ? areas[areas.length - 1] : null;
  if (!source) { window.print(); return; }

  document.getElementById("print-root")?.remove();
  const holder = document.createElement("div");
  holder.id = "print-root";
  holder.appendChild(source.cloneNode(true));
  document.body.appendChild(holder);
  document.documentElement.classList.add("printing");

  const cleanup = () => {
    document.documentElement.classList.remove("printing");
    document.getElementById("print-root")?.remove();
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
  // Safari/mobile sometimes skip afterprint.
  setTimeout(cleanup, 1500);
}
