/* Case pages: utm passthrough to the call door, jump menu close, contents scroll-spy. */
/* Last heading whose top is above the band, or -1. */
function casesPick(tops, band) {
  var cur = -1;
  for (var i = 0; i < tops.length; i++) if (tops[i] <= band) cur = i;
  return cur;
}
if (typeof document === "undefined") {
  module.exports = casesPick;
} else (function () {
  var d = document;
  var each = function (sel, fn) { Array.prototype.forEach.call(d.querySelectorAll(sel), fn); };

  /* Forward utm_* params to the Calendly door. */
  var utm = [];
  new URLSearchParams(location.search).forEach(function (v, k) {
    if (k.indexOf("utm_") === 0) utm.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
  });
  if (utm.length) each('a[data-door="call"]', function (a) {
    var h = a.getAttribute("href");
    a.setAttribute("href", h + (h.indexOf("?") < 0 ? "?" : "&") + utm.join("&"));
  });

  /* Close the phone "jump to section" menu after a pick. */
  each("details.jump a", function (a) {
    a.addEventListener("click", function () { a.closest("details").open = false; });
  });

  /* Highlight the section being read in the contents list. */
  var links = [], heads = [];
  each(".toc a", function (a) {
    var h = d.getElementById(decodeURIComponent(a.hash.slice(1)));
    if (h) { links.push(a); heads.push(h); }
  });
  if (!heads.length) return;
  var nav = d.querySelector(".nav"), busy = false;
  var update = function () {
    busy = false;
    var i = casesPick(heads.map(function (h) { return h.getBoundingClientRect().top; }),
      (nav ? nav.offsetHeight : 0) + 24);
    links.forEach(function (a, j) {
      a.classList.toggle("is-current", i === j);
      if (i === j) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
    });
  };
  var queue = function () { if (!busy) { busy = true; requestAnimationFrame(update); } };
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue);
  update();
})();
