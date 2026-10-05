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
  if (source.classList.contains("print-one-page")) fitToOnePage(holder);

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

// A4 sheet minus the 12mm @page margin (src/styles.css), in CSS px at 96dpi.
const SHEET = { width: 703, height: 1032 };
const MIN_ZOOM = 0.55;

/**
 * Shrink a `.print-one-page` document so it never spills onto a second
 * sheet. The html.printing styles apply on screen as well, so the clone can
 * be laid out at the sheet's printable width and measured before the print
 * dialog opens; `zoom` (unlike transform) changes the layout size, so the
 * page break moves with it.
 */
function fitToOnePage(holder: HTMLElement) {
  const heightAt = (zoom: number) => {
    holder.style.removeProperty("zoom");
    holder.style.width = `${SHEET.width / zoom}px`;
    return holder.getBoundingClientRect().height;
  };
  const budget = SHEET.height - 8;
  let zoom = 1;
  const natural = heightAt(1);
  if (natural > budget) {
    // Shrinking also widens the layout, which frees some height back; try
    // the gentler factor that implies and keep it only if it still fits.
    const safe = budget / natural;
    const gentler = Math.min(1, budget / heightAt(safe));
    zoom = heightAt(gentler) * gentler <= budget ? gentler : safe;
    zoom = Math.max(MIN_ZOOM, zoom);
  }
  holder.style.width = `${SHEET.width / zoom}px`;
  holder.style.setProperty("zoom", String(zoom));
}
