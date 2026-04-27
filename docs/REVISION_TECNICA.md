Revisión técnica recomendada
Correcciones aplicadas
Validación de entradas positivas en cálculos de Manning.
Eliminación de fallbacks silenciosos en interpolaciones fuera de tabla.
Separación de método racional con dos variantes de unidades:
`rationalFormula`: intensidad en L/s/ha.
`rationalFormulaFromMmHour`: intensidad en mm/h.
Inclusión de límites de diseño centralizados en `DESIGN_LIMITS`.
Limpieza de dependencias no usadas para despliegue estático.
Configuración `base: './'` para GitHub Pages.
`tsconfig` en modo estricto y alias `@/*` apuntando a `src/*`.
Puntos a revisar en la aplicación completa
Sustituir límites hardcodeados en páginas por `DESIGN_LIMITS`.
Mostrar advertencia cuando `isOutsideTable` sea `true`.
Evitar textos como "normativas internacionales" si la base docente es una asignatura concreta y guías españolas.
Revisar el uso de `q_min = 0.45 * q_med`: debe justificarse por enunciado o convertirse en parámetro editable.
En colectores de residuales, comprobar llenado máximo 75%; en pluviales, 85%; en prácticas docentes puede fijarse 80%.
En saneamiento con arenas, usar velocidad mínima 0.60 m/s; sin arenas, 0.30 m/s.
