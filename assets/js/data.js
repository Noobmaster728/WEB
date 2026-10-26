/* ==========================================================================
   BAREMOS PARA LA CALCULADORA
   Datos extraídos de las convocatorias oficiales (ver "source" en cada una).
   Revisa estos valores cada vez que salga una convocatoria nueva.
   Última revisión: octubre de 2026.

   Unidades: tiempos en segundos, distancias en metros, salto vertical en cm.
   type:
     - "steps":  tabla de umbrales (cada umbral = peor marca que aún da esa nota)
     - "interp": nota de 5 a 10 con interpolación lineal entre filas
     - "apto":   solo marca mínima (apto / no apto)
   dir: "low" = menos es mejor (tiempos), "high" = más es mejor
   ========================================================================== */

window.CALC_DATA = {
  "policia-nacional": {
    name: "Policía Nacional · Escala Básica",
    type: "steps",
    passRule: "Ninguna prueba con 0 y media de las tres ≥ 5",
    source: {
      label: "BOE-A-2026-15055 (convocatoria 2026, Anexo II)",
      url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-15055",
    },
    tests: [
      {
        id: "circuito",
        name: "Circuito de agilidad",
        input: "time",
        unit: "s",
        dir: "low",
        placeholder: "Ej. 10,4",
        H: [[8.2, 10], [8.8, 9], [9.3, 8], [9.7, 7], [10.1, 6], [10.5, 5], [10.9, 4], [11.2, 3], [11.4, 2], [11.6, 1]],
        M: [[9.3, 10], [9.8, 9], [10.3, 8], [10.8, 7], [11.2, 6], [11.6, 5], [12.0, 4], [12.3, 3], [12.5, 2], [12.7, 1]],
      },
      {
        id: "fuerza",
        name: { H: "Dominadas", M: "Suspensión con brazos flexionados" },
        input: { H: "number", M: "time" },
        unit: { H: "rep", M: "s" },
        dir: "high",
        placeholder: { H: "Ej. 10", M: "Ej. 55" },
        H: [[17, 10], [16, 9], [15, 8], [14, 7], [12, 6], [10, 5], [8, 4], [7, 3], [6, 2], [5, 1]],
        M: [[95, 10], [86, 9], [78, 8], [70, 7], [63, 6], [57, 5], [52, 4], [46, 3], [41, 2], [36, 1]],
      },
      {
        id: "1000",
        name: "Carrera 1.000 m",
        input: "time",
        unit: "s",
        dir: "low",
        placeholder: "Ej. 3:25",
        H: [[174, 10], [180, 9], [186, 8], [192, 7], [198, 6], [204, 5], [210, 4], [216, 3], [222, 2], [228, 1]],
        M: [[204, 10], [213, 9], [222, 8], [231, 7], [240, 6], [249, 5], [258, 4], [267, 3], [276, 2], [285, 1]],
      },
    ],
  },

  "policia-municipal-madrid": {
    name: "Policía Municipal de Madrid",
    type: "interp",
    passRule: "Mínimo 5 puntos en cada prueba · nota = media",
    source: {
      label: "BOAM núm. 9.829, 28/02/2025 (bases, Anexo II)",
      url: "https://sede.madrid.es/",
    },
    tests: [
      { id: "800", name: "Carrera 800 m", input: "time", unit: "s", dir: "low", placeholder: "Ej. 2:45",
        H: [170, 159, 148, 137, 126, 115], M: [210, 199, 188, 177, 166, 155] },
      { id: "60", name: "Carrera 60 m", input: "time", unit: "s", dir: "low", placeholder: "Ej. 8,7",
        H: [9.1, 8.68, 8.26, 7.84, 7.42, 7.0], M: [10.4, 9.98, 9.56, 9.14, 8.72, 8.3] },
      { id: "balon", name: { H: "Lanzamiento balón medicinal (5 kg)", M: "Lanzamiento balón medicinal (3 kg)" }, input: "number", unit: "m", dir: "high", placeholder: "Ej. 6,8",
        H: [5.5, 6.5, 7.5, 8.5, 9.5, 10.5], M: [5.5, 6.5, 7.5, 8.5, 9.5, 10.5] },
      { id: "salto", name: "Salto de longitud desde parado", input: "number", unit: "m", dir: "high", placeholder: "Ej. 2,30",
        H: [2.15, 2.35, 2.55, 2.75, 2.95, 3.15], M: [1.85, 2.05, 2.25, 2.45, 2.65, 2.85] },
      { id: "natacion", name: "Natación 25 m", input: "time", unit: "s", dir: "low", placeholder: "Ej. 20",
        H: [24, 21.2, 18.4, 15.6, 12.8, 10], M: [26, 23.2, 20.4, 17.6, 14.8, 12] },
    ],
  },

  "guardia-civil": {
    name: "Guardia Civil · Cabos y Guardias",
    type: "apto",
    ages: ["Menor de 35", "35 a 39", "40 o más"],
    passRule: "Apto en las cuatro pruebas",
    source: {
      label: "BOE-A-2026-9982 (convocatoria 2026, Apéndice II)",
      url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-9982",
    },
    tests: [
      { id: "2000", name: "Carrera 2.000 m", input: "time", unit: "s", dir: "low", placeholder: "Ej. 9:10",
        H: [565, 588, 633], M: [674, 695, 769] },
      { id: "circuito", name: "Circuito de agilidad y coordinación", input: "time", unit: "s", dir: "low", placeholder: "Ej. 13,5",
        H: [14.0, 14.4, 15.1], M: [16.0, 16.4, 17.9] },
      { id: "extensiones", name: "Extensiones de brazos", input: "number", unit: "rep", dir: "high", placeholder: "Ej. 20",
        H: [16, 16, 14], M: [11, 11, 9] },
      { id: "natacion", name: "Natación 50 m libre", input: "time", unit: "s", dir: "low", placeholder: "Ej. 55",
        H: [70, 71, 73], M: [81, 83, 88] },
    ],
  },

  "fuerzas-armadas": {
    name: "Fuerzas Armadas · Tropa y Marinería",
    type: "apto",
    passRule: "Apto en las cuatro pruebas",
    source: {
      label: "Orden DEF/15/2026 (BOE-A-2026-1379)",
      url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-1379",
    },
    tests: [
      { id: "flexiones", name: "Flexiones de brazos (máx. 2 min)", input: "number", unit: "rep", dir: "high", placeholder: "Ej. 15", H: 9, M: 5 },
      { id: "plancha", name: "Plancha isométrica", input: "time", unit: "s", dir: "high", placeholder: "Ej. 60", H: 40, M: 40 },
      { id: "circuito", name: "Circuito de agilidad-velocidad", input: "time", unit: "s", dir: "low", placeholder: "Ej. 14,8", H: 15.4, M: 17.1 },
      { id: "2000", name: "Carrera 2.000 m", input: "time", unit: "s", dir: "low", placeholder: "Ej. 10:30", H: 714, M: 778 },
    ],
  },

  "policia-local-andalucia": {
    name: "Policía Local de Andalucía · Policía",
    type: "apto",
    passRule: "Apto en todas las pruebas (natación solo si la exige el ayuntamiento)",
    source: {
      label: "Decreto 8/2026, de 28 de enero (Junta de Andalucía), Anexo II",
      url: "https://www.juntadeandalucia.es/boja",
    },
    tests: [
      { id: "50", name: "Carrera 50 m", input: "time", unit: "s", dir: "low", placeholder: "Ej. 7,9", H: 8.5, M: 9.5 },
      { id: "fuerza", name: { H: "Flexiones en barra (suspensión pura)", M: "Lanzamiento balón medicinal 3 kg" },
        input: "number", unit: { H: "rep", M: "m" }, dir: "high", placeholder: { H: "Ej. 10", M: "Ej. 5,8" }, H: 8, M: 5.25 },
      { id: "salto", name: "Salto vertical", input: "number", unit: "cm", dir: "high", placeholder: "Ej. 48", H: 44, M: 33 },
      { id: "circuito", name: "Circuito de agilidad", input: "time", unit: "s", dir: "low", placeholder: "Ej. 11,2", H: 11.6, M: 12.7 },
      { id: "1000", name: "Carrera 1.000 m", input: "time", unit: "s", dir: "low", placeholder: "Ej. 3:40", H: 230, M: 280 },
      { id: "natacion", name: "Natación 25 m (opcional según municipio)", input: "time", unit: "s", dir: "low", placeholder: "Ej. 24", H: 29, M: 35, optional: true },
    ],
  },
};
