// Archivo de progreso de estudio para ICSE 024 - Cátedra Pedrosa
// Guarda los números de días completados en el arreglo COMPLETED_DAYS.
// Puedes editar este archivo a mano o descargarlo actualizado desde la aplicación interactiva.
var COMPLETED_DAYS = [1, 2, 3, 4];

// Datos de tracking embebidos (se actualizan desde el sistema de tracking)
var TRACKING_DATA = {
  "estudiante": "ICSE 024 - Cátedra Pedrosa",
  "examen_final": "2026-07-17",
  "dias_completados": ["2026-06-30", "2026-07-01", "2026-07-02", "2026-07-03"],
  "conceptos_debiles": [
    {
      "concepto": "Incertidumbre electoral: suficiente vs necesario",
      "texto_origen": "Povse — Herramientas para analizar los regímenes políticos",
      "unidad": 1,
      "dia_errado": 1,
      "estado": "consolidado",
      "notas": "El usuario confundió necesario con suficiente. Pense que la incertidumbre electoral era necesaria para identificar una democracia, cuando en realidad es suficiente pero NO necesaria. Ejemplo: Argentina 1989 (Menem anunciado ganador y el país siguió siendo democracia). REFORZADO en Día 3 y Día 4. CONSOLIDADO."
    },
    {
      "concepto": "Las 4 formas de categorización de Povse — cuál NO corresponde",
      "texto_origen": "Povse — Herramientas para analizar los regímenes políticos",
      "unidad": 1,
      "dia_errado": 1,
      "estado": "pendiente",
      "notas": "No identificó correctamente cuál de las opciones NO era una de las 4 formas de categorización de Povse (tipos, oposición/autoritarismo, graduación/cuantía y calidad, exclusión). Necesita repasar las 4 categorías y qué las distingue entre sí."
    },
    {
      "concepto": "Relación Presentación ↔ Povse — concepto como problema vs solución",
      "texto_origen": "Presentación + Povse",
      "unidad": 1,
      "dia_errado": 1,
      "estado": "pendiente",
      "notas": "Dificultad para distinguir cuándo un concepto es ejemplo de un problema (como 'populismo' en la Presentación que se usa sin rigor) vs cuándo es una solución analítica (como 'régimen político' en Povse que se define con rigor). La Presentación habla del desgaste de 'populismo', no de 'régimen político'."
    },
    {
      "concepto": "Atribución cruzada Gellner ↔ Anderson",
      "texto_origen": "Valdés — Nación y Estado, asunto separado",
      "unidad": 1,
      "dia_errado": 2,
      "estado": "consolidado",
      "notas": "El usuario confundió a Gellner con Anderson y viceversa. Asignó a Anderson la tesis de los cambios económicos agrario-industriales (que es de Gellner) y a Gellner el concepto de 'comunidad imaginada' (que es de Anderson). Gellner = economía/productividad; Anderson = imaginación cultural/Modernidad. Hobsbawm no fue confundido. REFORZADO en Día 3 y Día 4. CONSOLIDADO."
    },
    {
      "concepto": "Estado rentístico y teoría rentística de Gervasoni",
      "texto_origen": "Pirsch — Aproximaciones a los sistemas federales",
      "unidad": 1,
      "dia_errado": 3,
      "estado": "consolidado",
      "notas": "El usuario confundió el concepto de 'Estado rentístico' (unidad subnacional que recibe grandes transferencias del gobierno central y tiende a menores niveles de democracia) con el concepto de 'bicameral' (tipo de legislatura con dos cámaras). REFORZADO en Día 4. CONSOLIDADO."
    },
    {
      "concepto": "Atribución Touraine ↔ Yannuzzi vs. Huntington ↔ Simone",
      "texto_origen": "Integración Día 3 (Simone + Yannuzzi)",
      "unidad": 1,
      "dia_errado": 3,
      "estado": "consolidado",
      "notas": "El usuario atribuyó a Yannuzzi un autor (Huntington) que en realidad es citado por Simone. Touraine (2000), citado únicamente por Yannuzzi para la definición de actores sociales, no fue identificado como perteneciente a ese texto. REFORZADO en Día 4. CONSOLIDADO."
    },
    {
      "concepto": "Confusión entre perspectiva carismática e ideológica (Petrino) en formato extendido",
      "texto_origen": "Petrino — De populismos y democracias",
      "unidad": 1,
      "dia_errado": 4,
      "estado": "parcialmente_reforzado",
      "notas": "El usuario conoce la tabla de perspectivas (economista/carismática/ideológica) y sus autores en formato directo. Error cuando la definición de perspectiva ideológica (discurso, demandas insatisfechas, significante vacío) aparece atribuida a la carismática en oración extendida de V/F."
    }
  ],
  "conceptos_consolidados": [
    "Definición de concepto (Presentación)",
    "Desgaste de significantes / etiquetas vacías (Presentación)",
    "Palabras vs realidad: decir ≠ hacer (Presentación)",
    "Definición weberiana de Estado (Gómez Talavera)",
    "Tipos de legitimación: tradicional, carismática, racional-legal (Gómez Talavera)",
    "Estado vs gobierno (Gómez Talavera)",
    "Polisemia de \"régimen\" (Povse)",
    "Grado de abstracción alto/bajo (Povse)",
    "Elecciones como criterio necesario pero no suficiente (Povse)",
    "Categorización por tipos (Povse)",
    "Categorización por oposición / autoritarismo (Povse)",
    "Categorización por graduación / cuantía y calidad (Povse)",
    "Democracias plenas en América Latina: Costa Rica y Uruguay (Povse)",
    "Etimología de 'Estado': status del latín (Sribman Mittelman)",
    "Cinco formas preestatales de organización política (Sribman Mittelman)",
    "Ciudad-Estado como antecedente del Estado moderno (Sribman Mittelman)",
    "Modelos de Estado por oposición al modelo anterior (Sribman Mittelman)",
    "Diferencia fascismo vs. socialismo: nacionalismo radical vs. internacionalismo (Sribman Mittelman)",
    "Tres grupos del Estado del bienestar en América Latina (Sribman Mittelman)",
    "Estado ≠ Nación: instituciones vs. identidad (Valdés)",
    "La nación se construye históricamente (Gellner, Anderson, Hobsbawm - Valdés)",
    "Mecanismos de construcción nacional: escuela, celebraciones, ritualización (Valdés)",
    "Censo 1895: dos de cada tres en Capital eran extranjeros (Valdés)",
    "Debate 'crisol de razas' vs. visión culturalista (Valdés)",
    "Democracia: término griego, gobierno directo que degeneró en tiranía (Simone)",
    "Doble revolución fines XVIII: norteamericana y francesa (Sartori, citado por Simone)",
    "Dos componentes del Estado XIX: liberal (Bobbio) y republicano (Simone)",
    "Ley Sáenz Peña: voto obligatorio, empadronamiento automático (Simone)",
    "Primera ola de democratización: fines XIX hasta 1914 (Huntington, citado por Simone)",
    "Poliarquía: Dahl, 6 atributos, versión mínima de democracia (Simone)",
    "Los 6 atributos de la poliarquía (Simone)",
    "Bloque socialista: no logró igualdad política ni económica (Simone)",
    "Regímenes híbridos: nacen de elecciones, mutan y destruyen la democracia (Simone)",
    "Populismo: concepto complejo, forma particular de entender el demos (Simone)",
    "Bourdieu: la gente NO necesita a los científicos sociales (Yannuzzi)",
    "Sociedad vs. comunidad: mismo Estado vs. pertenencia más próxima (Yannuzzi)",
    "Ciudadanía = derecho a tener derechos (Jelin/Arendt, citadas por Yannuzzi)",
    "Sociedad civil: generada DESDE la ciudadanía, NO por el Estado (Yannuzzi)",
    "Acción social: Weber — 4 tipos (Yannuzzi)",
    "Actores sociales: Touraine (2000) — sujetos colectivos con estrategias (Yannuzzi)",
    "Federalismo: múltiples niveles de gobierno; constitución escrita (Pirsch)",
    "4 países federales en AL: Brasil, México, Argentina, Venezuela (Gibson, 2004 - Pirsch)",
    "Tres modelos de Stepan: coming together, holding together, putting together (Pirsch)",
    "Riker: federación = negociación, NO imposición coercitiva (Pirsch)",
    "Federalismo argentino: 23 provincias + CABA; 3 senadores por subunidad (Pirsch)",
    "Última intervención federal: Kirchner en Santiago del Estero (Pirsch)",
    "Federalismo NO garantiza democracia a nivel subnacional (Gibson, 2004 - Pirsch)",
    "Tabla de perspectivas Petrino: economista (Touraine/Vilas/O'Donnell), carismática (Freidenberg/Weyland), ideológica (Laclau/de Ípola)",
    "Significante vacío: de Ípola (1979) — líder que condensa demandas sin respuesta",
    "Diferencias Yrigoyen vs. Perón: partido preexistente vs. movimiento desde el Estado"
  ],
  "resumen_global": {
    "total_preguntas": 47,
    "total_aciertos": 39,
    "total_errores": 8,
    "porcentaje_acierto": 83
  }
};