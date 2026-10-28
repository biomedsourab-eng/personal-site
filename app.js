// Loads content from /data/*.json and renders it.
// No backend. Editing happens in /admin/ which commits these files back to Git.

const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

async function load(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

function renderProfile(p) {
  document.title = p.name ? `${p.name}` : "Personal Site";
  $("name").textContent = p.name || "";
  $("role").textContent = p.role || "";
  $("tagline").textContent = p.tagline || "";
  $("about").textContent = p.about || "";
  $("footer-note").textContent = p.footer || "";

  const links = p.links || [];
  $("links").innerHTML = links
    .map(
      (l) =>
        `<a href="${esc(l.url)}" rel="noopener" target="_blank">${esc(l.label)}</a>`
    )
    .join("");
}

function renderAchievements(items) {
  const list = $("achievements");

  // newest first; blank years sink to bottom
  const sorted = [...items].sort(
    (a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0)
  );

  const cats = ["All", ...new Set(sorted.map((i) => i.category).filter(Boolean))];
  let active = "All";

  function paint() {
    const shown =
      active === "All" ? sorted : sorted.filter((i) => i.category === active);

    if (!shown.length) {
      list.innerHTML = `<li class="empty">Nothing here yet.</li>`;
      return;
    }

    list.innerHTML = shown
      .map(
        (i) => `
      <li>
        <div class="row">
          <h3>${esc(i.title)}</h3>
          ${i.year ? `<span class="year">${esc(i.year)}</span>` : ""}
          ${i.category ? `<span class="tag">${esc(i.category)}</span>` : ""}
        </div>
        ${i.details ? `<p class="details">${esc(i.details)}</p>` : ""}
        ${
          i.link
            ? `<a class="more" href="${esc(i.link)}" rel="noopener" target="_blank">View</a>`
            : ""
        }
      </li>`
      )
      .join("");
  }

  $("filters").innerHTML = cats
    .map(
      (c) =>
        `<button type="button" data-cat="${esc(c)}" aria-pressed="${c === active}">${esc(c)}</button>`
    )
    .join("");

  $("filters").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    active = btn.dataset.cat;
    [...$("filters").children].forEach((b) =>
      b.setAttribute("aria-pressed", b.dataset.cat === active)
    );
    paint();
  });

  paint();
}

(async () => {
  try {
    const [profile, achievements] = await Promise.all([
      load("/data/profile.json"),
      load("/data/achievements.json"),
    ]);
    renderProfile(profile);
    renderAchievements(achievements.items || []);
  } catch (err) {
    console.error(err);
    $("achievements").innerHTML = `<li class="empty">Could not load content.</li>`;
  }
})();
