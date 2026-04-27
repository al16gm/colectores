# SaniDimension

Herramienta educativa para el dimensionamiento hidráulico de colectores, secciones circulares, ovoides, galerías y elementos de saneamiento.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Recharts
- Motion
- Lucide React

## Instalación

```bash
npm install
npm run dev
```

## Comprobación y build

```bash
npm run typecheck
npm run build
npm run preview
```

## Estructura recomendada

```text
src/
  components/   Componentes reutilizables
  lib/          Cálculos hidráulicos, constantes y tablas
  pages/        Pantallas de problemas y recursos
  App.tsx       Navegación y layout principal
  main.tsx      Entrada React
```

## Notas técnicas

- Los diámetros se tratan como diámetro interior en los cálculos hidráulicos salvo que la norma de producto indique lo contrario.
- Los cálculos de flujo uniforme usan Manning.
- Las relaciones de llenado parcial se obtienen por interpolación lineal en tablas hidráulicas.
- Esta herramienta es docente. Para proyecto constructivo debe contrastarse con normativa local, pliegos y catálogos de fabricante.
