/* ==========================================================================
   Lógica del sitio: menú, pestañas, calculadora, test de nivel y envío de leads.
   Sin dependencias. Depende de config.js (window.SITE) y data.js (window.CALC_DATA).
   ========================================================================== */
(function () {
  "use strict";

  var SITE = window.SITE || {};
  var CALC = window.CALC_DATA || {};
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------------- utils */
  function whatsappUrl(text) {
    var base = "https://wa.me/" + (SITE.contact && SITE.contact.whatsapp ? SITE.contact.whatsapp : "");
    return text ? base + "?text=" + encodeURIComponent(text) : base;
  }

  function track(name, params) {
    // Compatible con Google Tag Manager / GA4 si se añaden más adelante.
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, params || {}));
  }

  // Número en formato español. Con "decimals" fija los decimales; sin él quita ceros sobrantes.
  function fmtNum(n, decimals) {
    if (decimals != null) return n.toFixed(decimals).replace(".", ",");
    return String(Math.round(n * 100) / 100).replace(".", ",");
  }

  function fmtMark(v, unit) {
    if (v == null || isNaN(v)) return "—";
    if (unit === "s") {
      if (v >= 60) {
        var m = Math.floor(v / 60);
        var s = v - m * 60;
        var sTxt = (Math.round(s * 10) / 10).toFixed(s % 1 ? 1 : 0).replace(".", ",");
        if (s < 10) sTxt = "0" + sTxt;
        return m + ":" + sTxt;
      }
      return fmtNum(Math.round(v * 100) / 100) + " s";
    }
    if (unit === "rep") return Math.round(v) + " rep.";
    if (unit === "m") return fmtNum(Math.round(v * 100) / 100) + " m";
    if (unit === "cm") return Math.round(v) + " cm";
    return String(v);
  }

  function parseMark(raw) {
    if (raw == null) return null;
    var s = String(raw).trim().replace(/\s/g, "").replace(/['’´]/g, ":").replace(/"/g, "").replace(",", ".");
    if (!s) return null;
    if (s.indexOf(":") > -1) {
      var p = s.split(":");
      var mm = parseFloat(p[0]);
      var ss = parseFloat(p[1] || "0");
      if (isNaN(mm) || isNaN(ss)) return null;
      return mm * 60 + ss;
    }
    var n = parseFloat(s);
    return isNaN(n) ? null : n;
  }

  function bySex(val, sex) {
    return val && typeof val === "object" && !Array.isArray(val) && (val.H !== undefined || val.M !== undefined) ? val[sex] : val;
  }

  /* --------------------------------------------------- contenido dinámico */
  function applySiteConfig() {
    $$('[data-site="city"]').forEach(function (el) {
      if (SITE.city && SITE.city !== "TU CIUDAD") el.textContent = SITE.city;
    });

    $$('[data-site="email-link"]').forEach(function (el) {
      if (SITE.contact && SITE.contact.email) {
        el.href = "mailto:" + SITE.contact.email;
      }
    });

    $$("[data-wa]").forEach(function (el) {
      el.href = whatsappUrl(el.getAttribute("data-wa"));
      el.target = "_blank";
      el.rel = "noopener";
      el.addEventListener("click", function () { track("whatsapp_click", { location: el.getAttribute("data-track") || "link" }); });
    });

    if (SITE.prices) {
      Object.keys(SITE.prices).forEach(function (k) {
        var price = SITE.prices[k];
        var box = $('[data-price="' + k + '"]');
        if (box && typeof price === "number") {
          box.innerHTML = "<strong>" + price + " €</strong><span>/ mes</span>";
        }
      });
    }

    if (SITE.photo) {
      var portrait = $("#portrait");
      if (portrait) {
        var img = new Image();
        img.src = SITE.photo;
        img.alt = "Jesús Hernández, preparador físico de oposiciones";
        img.loading = "lazy";
        img.width = 800;
        img.height = 1000;
        var mono = $(".portrait__monogram", portrait);
        if (mono) portrait.replaceChild(img, mono);
      }
    }

    var socials = $("#socials");
    if (socials && SITE.social) {
      var icons = { instagram: "i-ig", tiktok: "i-tt", youtube: "i-yt" };
      var labels = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube" };
      Object.keys(icons).forEach(function (k) {
        if (!SITE.social[k]) return;
        var a = document.createElement("a");
        a.href = SITE.social[k];
        a.target = "_blank";
        a.rel = "noopener";
        a.setAttribute("aria-label", labels[k]);
        a.innerHTML = '<svg aria-hidden="true"><use href="#' + icons[k] + '"/></svg>';
        socials.appendChild(a);
      });
      var wa = document.createElement("a");
      wa.href = whatsappUrl();
      wa.target = "_blank";
      wa.rel = "noopener";
      wa.setAttribute("aria-label", "WhatsApp");
      wa.innerHTML = '<svg aria-hidden="true"><use href="#i-wa"/></svg>';
      socials.appendChild(wa);
    }

    var list = $("#testimonials-list");
    if (list && Array.isArray(SITE.testimonials) && SITE.testimonials.length) {
      SITE.testimonials.forEach(function (t) {
        var fig = document.createElement("figure");
        fig.className = "card quote";
        var q = document.createElement("blockquote");
        q.textContent = "“" + t.text + "”";
        var cap = document.createElement("figcaption");
        var strong = document.createElement("strong");
        strong.textContent = t.name;
        cap.appendChild(strong);
        cap.appendChild(document.createTextNode(t.detail || ""));
        fig.appendChild(q);
        fig.appendChild(cap);
        list.appendChild(fig);
      });
      $("#testimonios").hidden = false;
    }

    var year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------- cabecera/menú */
  function initHeader() {
    var header = $(".site-header");
    var toggle = $(".menu-toggle");
    var nav = $("#nav");
    if (!header) return;

    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (!toggle || !nav) return;
    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      nav.classList.toggle("is-open", open);
    }
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  /* -------------------------------------------------------------- pestañas */
  function initTabs() {
    var tabs = $$('[role="tab"]');
    if (!tabs.length) return;

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab); });
      tab.addEventListener("keydown", function (e) {
        var idx = null;
        if (e.key === "ArrowRight") idx = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") idx = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") idx = 0;
        if (e.key === "End") idx = tabs.length - 1;
        if (idx !== null) {
          e.preventDefault();
          select(tabs[idx], true);
        }
      });
    });

    $$("[data-tab]").forEach(function (link) {
      link.addEventListener("click", function () {
        var tab = document.getElementById("tab-" + link.getAttribute("data-tab"));
        if (tab) select(tab);
      });
    });
  }

  /* ------------------------------------------------------------ calculadora */
  var calcState = { summary: "", op: "" };

  var OP_TO_FORM = {
    "policia-nacional": "Policía Nacional",
    "guardia-civil": "Guardia Civil",
    "policia-municipal-madrid": "Policía Local / Municipal",
    "policia-local-andalucia": "Policía Local / Municipal",
    "fuerzas-armadas": "Fuerzas Armadas",
  };

  function scoreTest(op, test, sex, ageIdx, value) {
    var unit = bySex(test.unit, sex);
    var table = test[sex];
    var low = test.dir === "low";
    var r = { value: value, unit: unit, pts: null, pass: null, next: null, nextLabel: "" };

    if (op.type === "steps") {
      var pts = 0;
      for (var i = 0; i < table.length; i++) {
        if (low ? value <= table[i][0] + 1e-9 : value >= table[i][0] - 1e-9) { pts = table[i][1]; break; }
      }
      r.pts = pts;
      r.pass = pts > 0;
      if (pts < 10) {
        var target = table.filter(function (row) { return row[1] === pts + 1; })[0];
        if (target) {
          r.next = target[0];
          r.nextLabel = (pts === 0 ? "Para no tener un 0" : "Para sacar un " + (pts + 1)) + ": " + (low ? "≤ " : "≥ ") + fmtMark(target[0], unit);
        }
      }
    } else if (op.type === "interp") {
      var a = table; // marcas para 5,6,7,8,9,10
      var worse = low ? value > a[0] + 1e-9 : value < a[0] - 1e-9;
      var best = low ? value <= a[5] + 1e-9 : value >= a[5] - 1e-9;
      if (worse) {
        r.pts = 0;
        r.pass = false;
        r.nextLabel = "Mínimo para aprobar (5): " + (low ? "≤ " : "≥ ") + fmtMark(a[0], unit);
      } else if (best) {
        r.pts = 10;
        r.pass = true;
      } else {
        for (var j = 0; j < 5; j++) {
          var hi = a[j], lo = a[j + 1];
          var inSeg = low ? value <= hi + 1e-9 && value >= lo - 1e-9 : value >= hi - 1e-9 && value <= lo + 1e-9;
          if (inSeg) {
            r.pts = Math.round((5 + j + (hi - value) / (hi - lo)) * 100) / 100;
            break;
          }
        }
        r.pass = true;
        var nextInt = Math.floor(r.pts) + 1;
        if (nextInt <= 10) {
          r.nextLabel = "Para sacar un " + nextInt + ": " + (low ? "≤ " : "≥ ") + fmtMark(a[nextInt - 5], unit);
        }
      }
    } else {
      var thr = Array.isArray(table) ? table[ageIdx || 0] : table;
      r.pass = low ? value <= thr + 1e-9 : value >= thr - 1e-9;
      r.min = thr;
      var diff = Math.abs(value - thr);
      if (r.pass) {
        r.nextLabel = "Margen sobre el mínimo: " + (unit === "rep" ? Math.round(diff) + " rep." : unit === "s" ? fmtNum(Math.round(diff * 10) / 10) + " s" : fmtMark(diff, unit));
      } else {
        r.nextLabel = "Te faltan " + (unit === "rep" ? Math.ceil(diff) + " rep." : unit === "s" ? fmtNum(Math.round(diff * 10) / 10) + " s" : fmtMark(diff, unit)) + " (mínimo " + fmtMark(thr, unit) + ")";
      }
    }
    return r;
  }

  function initCalculator() {
    var form = $("#calc-form");
    var out = $("#calc-result");
    if (!form || !out) return;
    var opSel = $("#calc-op");
    var ageField = $("#calc-age-field");
    var ageSel = $("#calc-age");
    var testsBox = $("#calc-tests");

    Object.keys(CALC).forEach(function (key) {
      var o = document.createElement("option");
      o.value = key;
      o.textContent = CALC[key].name;
      opSel.appendChild(o);
    });

    function sex() { return (form.querySelector('input[name="sex"]:checked') || {}).value || "H"; }

    function buildInputs() {
      var op = CALC[opSel.value];
      var s = sex();
      // Las marcas se conservan al cambiar de sexo, pero no al cambiar de oposición (las pruebas son distintas)
      var prev = {};
      if (testsBox.getAttribute("data-op") === opSel.value) {
        $$("input[data-test]", testsBox).forEach(function (inp) { prev[inp.getAttribute("data-test")] = inp.value; });
      }
      testsBox.setAttribute("data-op", opSel.value);
      testsBox.innerHTML = "";

      if (op.ages) {
        ageField.hidden = false;
        if (ageSel.getAttribute("data-op") !== opSel.value) {
          ageSel.innerHTML = "";
          op.ages.forEach(function (label, i) {
            var o = document.createElement("option");
            o.value = String(i);
            o.textContent = label;
            ageSel.appendChild(o);
          });
          ageSel.setAttribute("data-op", opSel.value);
        }
      } else {
        ageField.hidden = true;
      }

      op.tests.forEach(function (t) {
        var id = "calc-" + t.id;
        var wrap = document.createElement("div");
        wrap.className = "field";
        var unit = bySex(t.unit, s);
        var unitTxt = { s: "tiempo", rep: "repeticiones", m: "metros", cm: "centímetros" }[unit] || "";
        var label = document.createElement("label");
        label.className = "label";
        label.htmlFor = id;
        label.textContent = bySex(t.name, s) + " (" + unitTxt + ")";
        var inp = document.createElement("input");
        inp.className = "input";
        inp.id = id;
        inp.type = "text";
        inp.inputMode = bySex(t.input, s) === "time" ? "text" : "decimal";
        inp.autocomplete = "off";
        inp.placeholder = bySex(t.placeholder, s) || "";
        inp.setAttribute("data-test", t.id);
        if (prev[t.id] && bySex(t.input, s) === bySex(t.input, s === "H" ? "M" : "H")) inp.value = prev[t.id];
        wrap.appendChild(label);
        wrap.appendChild(inp);
        testsBox.appendChild(wrap);
      });
      compute();
    }

    function compute() {
      var key = opSel.value;
      var op = CALC[key];
      var s = sex();
      var ageIdx = op.ages ? parseInt(ageSel.value || "0", 10) : 0;
      var rows = [];
      op.tests.forEach(function (t) {
        var inp = $('input[data-test="' + t.id + '"]', testsBox);
        var v = parseMark(inp && inp.value);
        inp.setAttribute("aria-invalid", inp.value && v === null ? "true" : "false");
        if (v === null) return;
        rows.push({ test: t, name: bySex(t.name, s), r: scoreTest(op, t, s, ageIdx, v) });
      });
      render(op, key, s, ageIdx, rows);
    }

    function render(op, key, s, ageIdx, rows) {
      if (!rows.length) {
        out.innerHTML = '<div class="calc-result__empty"><svg aria-hidden="true"><use href="#i-calc"/></svg>Introduce al menos una marca para ver tu resultado.</div>';
        calcState.summary = "";
        return;
      }
      var required = op.tests.filter(function (t) { return !t.optional; }).length;
      var entered = rows.filter(function (x) { return !x.test.optional; }).length;
      var complete = entered >= required;
      var failed = rows.filter(function (x) { return x.r.pass === false; });

      var totalHtml, badge, msg;
      if (op.type === "apto") {
        var passed = rows.filter(function (x) { return x.r.pass; }).length;
        totalHtml = passed + "/" + rows.length;
        if (failed.length) {
          badge = '<span class="badge badge--ko">No apto</span>';
          msg = "Hoy no superarías " + (failed.length === 1 ? "la prueba de <strong>" + failed[0].name.toLowerCase() + "</strong>" : "<strong>" + failed.length + " pruebas</strong>") + ". Con un plan específico es totalmente recuperable.";
        } else if (complete) {
          badge = '<span class="badge badge--ok">Apto</span>';
          msg = "Llegas a todas las marcas. Ahora toca <strong>ganar margen</strong>: los nervios y el cansancio del día del examen restan.";
        } else {
          badge = '<span class="badge">Incompleto</span>';
          msg = "De momento vas bien. Completa todas las pruebas para ver el resultado global.";
        }
      } else {
        var sum = rows.reduce(function (acc, x) { return acc + (x.r.pts || 0); }, 0);
        var avg = sum / rows.length;
        totalHtml = fmtNum(Math.round(avg * 100) / 100, 2);
        if (failed.length) {
          badge = '<span class="badge badge--ko">Eliminado</span>';
          msg = (op.type === "steps" ? "Un 0" : "Menos de un 5") + " en <strong>" + failed.map(function (x) { return x.name.toLowerCase(); }).join(", ") + "</strong> te dejaría fuera. Es lo primero que hay que asegurar.";
        } else if (!complete) {
          badge = '<span class="badge">Parcial</span>';
          msg = "Media de las pruebas introducidas. Completa todas para ver tu nota final.";
        } else if (op.type === "steps" && avg < 5) {
          badge = '<span class="badge badge--ko">No apto</span>';
          msg = "Necesitas una media de 5 para superar la prueba física. Estás a <strong>" + fmtNum(Math.round((5 - avg) * 100) / 100, 2) + " puntos</strong>.";
        } else {
          badge = '<span class="badge badge--ok">Apto</span>';
          msg = avg >= 8 ? "Gran nivel. A partir de aquí cada décima cuenta para la plaza." : "Superas la prueba, pero <strong>esta nota suma para la plaza</strong>: hay margen para subir.";
        }
      }

      var html = '<div class="calc-total"><div><div class="calc-total__label">' + (op.type === "apto" ? "Pruebas superadas" : "Nota estimada") + '</div><div class="calc-total__value">' + totalHtml + "</div></div>" + badge + "</div>";
      rows.forEach(function (x) {
        var pts = op.type === "apto"
          ? '<span class="badge ' + (x.r.pass ? "badge--ok" : "badge--ko") + '">' + (x.r.pass ? "Apto" : "No apto") + "</span>"
          : '<span class="score-row__pts">' + fmtNum(x.r.pts, op.type === "interp" ? 2 : 0) + "</span>";
        var pct = op.type === "apto" ? (x.r.pass ? 100 : 35) : Math.max(4, (x.r.pts / 10) * 100);
        html += '<div class="score-row"><span class="score-row__name">' + x.name + "</span>" + pts +
          '<span class="score-row__mark">' + fmtMark(x.r.value, x.r.unit) + (x.r.nextLabel ? " · " + x.r.nextLabel : "") + "</span>" +
          '<span class="bar"><i style="width:' + pct + "%" + (x.r.pass === false ? ";background:var(--ko)" : "") + '"></i></span></div>';
      });
      html += '<p class="calc-msg">' + msg + "</p>";
      html += '<div class="calc-cta"><a class="btn btn--block" href="#test" id="calc-to-form">Quiero un plan para mejorar mi nota</a>' +
        '<a class="btn btn--wa btn--block" id="calc-to-wa" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-wa"/></svg> Enviar mis marcas a Jesús</a></div>';
      html += '<p class="calc-disclaimer">Estimación orientativa según ' + (op.source ? '<a href="' + op.source.url + '" target="_blank" rel="noopener">' + op.source.label + "</a>" : "la convocatoria") + ". " + op.passRule + ". Comprueba siempre las bases de tu convocatoria.</p>";
      out.innerHTML = html;

      // Resumen para el lead
      var lines = rows.map(function (x) {
        return "- " + x.name + ": " + fmtMark(x.r.value, x.r.unit) + " → " + (op.type === "apto" ? (x.r.pass ? "apto" : "no apto") : fmtNum(x.r.pts, op.type === "interp" ? 2 : 0) + " ptos");
      });
      calcState.op = key;
      calcState.summary = op.name + " (" + (s === "H" ? "hombre" : "mujer") + (op.ages ? ", " + op.ages[ageIdx] : "") + ")\n" + lines.join("\n") + "\nResultado: " + totalHtml + " " + badge.replace(/<[^>]+>/g, "");

      $("#calc-to-wa").href = whatsappUrl("Hola Jesús, he usado la calculadora de tu web:\n" + calcState.summary + "\n\n¿Me ayudas a mejorar?");
      $("#calc-to-wa").addEventListener("click", function () { track("whatsapp_click", { location: "calculadora" }); });
      $("#calc-to-form").addEventListener("click", function () {
        prefillLead(OP_TO_FORM[key], calcState.summary);
        track("calc_to_form", { oposicion: key });
      });
    }

    var t;
    form.addEventListener("input", function (e) {
      if (e.target.name === "sex") return;
      clearTimeout(t);
      t = setTimeout(compute, 150);
    });
    form.addEventListener("change", function (e) {
      if (e.target === opSel || e.target.name === "sex") buildInputs();
      else compute();
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); compute(); });

    var tracked = false;
    form.addEventListener("input", function () {
      if (!tracked) { tracked = true; track("calc_start"); }
    });

    $$("[data-calc]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        opSel.value = btn.getAttribute("data-calc");
        buildInputs();
      });
    });

    buildInputs();
  }

  /* --------------------------------------------------------- test de nivel */
  var leadForm;

  function prefillLead(oposicion, calcSummary) {
    if (!leadForm) return;
    if (oposicion) {
      var r = leadForm.querySelector('input[name="oposicion"][value="' + oposicion + '"]');
      if (r) r.checked = true;
    }
    if (calcSummary) $("#lf-calc").value = calcSummary;
  }

  function initLeadForm() {
    leadForm = $("#lead-form");
    if (!leadForm) return;
    var steps = $$(".form-step", leadForm);
    var bars = $$(".steps-bar i", leadForm);
    var prevBtn = $("[data-prev]", leadForm);
    var nextBtn = $("[data-next]", leadForm);
    var submitBtn = $("[data-submit]", leadForm);
    var status = $("#form-status");
    var announce = $("#step-announce");
    var current = 1;
    var started = false;

    function showStep(n) {
      current = n;
      steps.forEach(function (s) { s.hidden = Number(s.getAttribute("data-step")) !== n; });
      bars.forEach(function (b, i) { b.classList.toggle("is-done", i < n); });
      prevBtn.hidden = n === 1;
      nextBtn.hidden = n === steps.length;
      submitBtn.hidden = n !== steps.length;
      if (announce) announce.textContent = "Paso " + n + " de " + steps.length;
    }

    function setError(name, msg) {
      var el = leadForm.querySelector('[data-error="' + name + '"]');
      if (el) el.textContent = msg || "";
      var input = leadForm.querySelector('[name="' + name + '"]');
      if (input && input.type !== "radio" && input.type !== "checkbox") input.setAttribute("aria-invalid", msg ? "true" : "false");
    }

    function validateStep(n) {
      var ok = true;
      var stepEl = steps[n - 1];
      $$("[data-required]", stepEl).forEach(function (group) {
        var name = group.getAttribute("data-required");
        var checked = leadForm.querySelector('input[name="' + name + '"]:checked');
        setError(name, checked ? "" : "Elige una opción.");
        if (!checked) ok = false;
      });
      if (n === 3) {
        var nombre = leadForm.nombre.value.trim();
        var tel = leadForm.telefono.value.replace(/[\s.\-()]/g, "");
        var email = leadForm.email.value.trim();
        setError("nombre", nombre.length >= 2 ? "" : "Escribe tu nombre.");
        setError("telefono", /^\+?\d{9,15}$/.test(tel) ? "" : "Introduce un teléfono válido.");
        setError("email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "" : "Introduce un email válido.");
        setError("privacidad", leadForm.privacidad.checked ? "" : "Necesitamos tu consentimiento para responderte.");
        ok = ok && nombre.length >= 2 && /^\+?\d{9,15}$/.test(tel) && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && leadForm.privacidad.checked;
      }
      if (!ok) {
        var firstErr = $$(".error-msg", stepEl).filter(function (e) { return e.textContent; })[0];
        if (firstErr) firstErr.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      return ok;
    }

    leadForm.addEventListener("change", function (e) {
      if (!started) { started = true; track("lead_start"); }
      if (e.target.type === "radio") setError(e.target.name, "");
    });

    nextBtn.addEventListener("click", function () {
      if (!validateStep(current)) return;
      showStep(current + 1);
      track("lead_step", { step: current });
      var first = steps[current - 1].querySelector("input, textarea");
      if (first) first.focus({ preventScroll: true });
      leadForm.scrollIntoView({ block: "start", behavior: "smooth" });
    });
    prevBtn.addEventListener("click", function () { showStep(current - 1); });

    // Botones de planes / bomberos que preseleccionan opciones
    $$("[data-plan]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var map = { online: "Online", presencial: "Presencial", premium: "Premium (con nutrición)" };
        var r = leadForm.querySelector('input[name="modalidad"][value="' + map[btn.getAttribute("data-plan")] + '"]');
        if (r) r.checked = true;
        track("plan_click", { plan: btn.getAttribute("data-plan") });
      });
    });
    $$("[data-op]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        prefillLead({ bomberos: "Bomberos" }[btn.getAttribute("data-op")]);
      });
    });

    leadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateStep(3)) return;

      var fd = new FormData(leadForm);
      var data = {};
      fd.forEach(function (v, k) { data[k] = typeof v === "string" ? v.trim() : v; });
      data.comunicaciones = data.comunicaciones === "si" ? "Sí" : "No";
      data.origen = location.href;
      data.fecha_envio = new Date().toISOString();

      var summary =
        "Hola Jesús, soy " + data.nombre + ". Acabo de hacer el test de nivel:\n" +
        "- Oposición: " + data.oposicion + "\n" +
        "- Pruebas: " + data.fecha + "\n" +
        "- Nivel: " + data.nivel + "\n" +
        "- Modalidad: " + data.modalidad +
        (data.comentario ? "\n- Comentario: " + data.comentario : "") +
        (data.calculadora ? "\n\nMis marcas (calculadora):\n" + data.calculadora : "");

      // Bot detectado: simulamos éxito sin enviar nada
      if (data.botcheck) { location.href = "gracias.html"; return; }
      delete data.botcheck;

      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando…";
      status.textContent = "";
      status.className = "form-status";

      sendLead(data).then(function (delivered) {
        track("generate_lead", { oposicion: data.oposicion, modalidad: data.modalidad, delivered: delivered });
        try {
          sessionStorage.setItem("jh_lead", JSON.stringify({ nombre: data.nombre, summary: summary, delivered: delivered }));
        } catch (err) { /* almacenamiento no disponible */ }
        location.href = "gracias.html" + (delivered ? "" : "?wa=1");
      });
    });

    showStep(1);
  }

  function sendLead(data) {
    var cfg = SITE.leads || {};
    var jobs = [];

    if (cfg.web3formsKey) {
      jobs.push(
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(Object.assign({
            access_key: cfg.web3formsKey,
            subject: "Nuevo lead: " + data.nombre + " · " + data.oposicion,
            from_name: "Web " + (SITE.name || ""),
            replyto: data.email,
          }, data)),
        }).then(function (r) { return r.json(); }).then(function (j) { return !!j.success; })
      );
    }
    if (cfg.webhookUrl) {
      jobs.push(
        fetch(cfg.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).then(function (r) { return r.ok; })
      );
    }
    if (!jobs.length) return Promise.resolve(false);

    var timeout = new Promise(function (resolve) { setTimeout(function () { resolve([false]); }, 10000); });
    return Promise.race([
      Promise.all(jobs.map(function (p) { return p.catch(function () { return false; }); })),
      timeout,
    ]).then(function (results) { return results.some(Boolean); });
  }

  /* ----------------------------------------------------------------- init */
  applySiteConfig();
  initHeader();
  initTabs();
  initCalculator();
  initLeadForm();
})();
