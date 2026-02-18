# Plan de Plataforma Operativa — Construcción de Lujo

---

apa | Herramienta | Razón |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | SSR, API routes, middleware para auth, deploy fácil en Vercel |
| Lenguaje | **TypeScript** | Tipado estricto = menos bugs como desarrollador solo |
| Auth | **Supabase Auth** (desde el día 1) | Gratuito hasta 50K MAUs, soporta RBAC, row-level security |
| Base de datos futura | **Supabase (PostgreSQL)** | Cuando migres de Airtable |
| Datos actuales | **Airtable API** vía capa de abstracción | Mientras migras |
| Almacenamiento multimedia | **Supabase Storage** (desde el día 1) | Resuelve el problema de URLs expiradas de Airtable |
| Estado del cliente | **TanStack Query (React Query)** | Cache, revalidación, loading states automáticos |
| UI Components | **shadcn/ui + Tailwind CSS** | Rápido de construir, profesional, personalizable |
| Formularios | **React Hook Form + Zod** | Validación tipada, performante |
| Tablas/Grids | **TanStack Table** | Sorting, filtering, paginación — ideal para timesheets |
| Deploy | **Vercel** | CI/CD automático desde GitHub, preview por PR |
| Monorepo/Estructura | **Turborepo** (opcional) | Solo si más adelante agregas apps móviles o paquetes compartidos |

---

## 2. Estrategia Mobile First

### Filosofía de Diseño

```
DISEÑAR ASÍ:          NO ASÍ:
Mobile → Tablet → PC   PC → "hacerlo responsive"
```

Con Tailwind, esto significa que los estilos **base** son para móvil y usas `md:` y `lg:` para expandir a pantallas más grandes. Nunca al revés.

```tsx
// ✅ CORRECTO — Mobile first
<div className="flex flex-col gap-2 md:flex-row md:gap-4 lg:gap-6">
  <div className="w-full md:w-1/2 lg:w-1/3">...</div>
</div>

// ❌ INCORRECTO — Desktop first
<div className="flex flex-row gap-6 sm:flex-col sm:gap-2">...</div>
```

### Navegación Mobile-First

```
MOBILE (< 768px)                    DESKTOP (≥ 1024px)
┌─────────────────────┐             ┌──────┬──────────────────┐
│     Header/Logo     │             │      │                  │
├─────────────────────┤             │ Side │    Contenido     │
│                     │             │ bar  │    Principal     │
│    Contenido        │             │      │                  │
│    Principal        │             │      │                  │
│                     │             │      │                  │
├─────────────────────┤             └──────┴──────────────────┘
│ 🏠  📋  ➕  📊  👤 │  ← Bottom Nav (solo mobile)
└─────────────────────┘
```

**Componentes clave de navegación:**
- **Mobile:** Bottom navigation bar fija (máx 5 iconos), menú hamburguesa para opciones secundarias
- **Desktop:** Sidebar colapsable a la izquierda
- **Ambos:** Mismo componente `<AppShell>` que renderiza uno u otro según breakpoint

### Componente de detección de dispositivo

```typescript
// src/hooks/useDeviceContext.ts
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function useDeviceContext() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return { isMobile, isTablet, isDesktop };
}
```

### Funcionalidades Exclusivas de Mobile

Algunas funcionalidades solo tienen sentido en móvil (ej: fichaje rápido en obra, fotos de avance). Para esto:

```typescript
// src/components/layout/MobileOnly.tsx
export function MobileOnly({ children, fallback }: {
  children: React.ReactNode;
  fallback?: React.ReactNode; // Mensaje opcional para desktop
}) {
  const { isMobile } = useDeviceContext();

  if (!isMobile) {
    return fallback ?? (
      <div className="text-center p-8 text-gray-500">
        Esta funcionalidad está disponible solo desde dispositivos móviles.
      </div>
    );
  }

  return <>{children}</>;
}

// Uso:
<MobileOnly fallback={<p>Abre esta sección desde tu teléfono</p>}>
  <QuickClockIn />
</MobileOnly>
```

### Patrones Mobile-First para Tablas de Datos

Las tablas (como timesheets) en móvil se convierten en tarjetas apiladas:

```
MOBILE — Cards                    DESKTOP — Tabla tradicional
┌─────────────────────┐          ┌────┬──────┬───────┬──────┐
│ 📅 Lun 17 Feb       │          │Fecha│Proy. │Horas  │Estado│
│ Proyecto: Torre Azul │          ├────┼──────┼───────┼──────┤
│ Horas: 8.0          │          │17/2 │Torre │ 8.0   │ ✓    │
│ Estado: ✅ Aprobado  │          │16/2 │Villa │ 6.5   │ ⏳   │
├─────────────────────┤          │15/2 │Torre │ 9.0   │ ✓    │
│ 📅 Dom 16 Feb       │          └────┴──────┴───────┴──────┘
│ Proyecto: Villa Mar  │
│ Horas: 6.5          │
│ Estado: ⏳ Pendiente │
└─────────────────────┘
```

```tsx
// Patrón de componente responsive
export function TimesheetView({ entries }: Props) {
  const { isMobile } = useDeviceContext();

  return isMobile
    ? <TimesheetCards entries={entries} />
    : <TimesheetTable entries={entries} />;
}
```

### Consideraciones técnicas mobile

- **Touch targets:** mínimo 44x44px para botones (estándar Apple/Google)
- **Swipe actions:** usar librería `@use-gesture/react` para gestos swipe en cards (ej: swipe para aprobar/rechazar timesheet)
- **Pull to refresh:** implementar con `@use-gesture/react` + TanStack Query `refetch()`
- **Offline awareness:** mostrar banner cuando no hay conexión (el sistema sigue siendo web, pero el usuario debe saber)
- **PWA opcional (futuro):** Next.js soporta `next-pwa` para instalar como app en el teléfono sin app store

---

## 3. Generación de Reportes PDF

### Estrategia de PDFs

Los clientes y directivos necesitan reportes descargables en PDF desde sus teléfonos. Esto requiere una solución que funcione bien tanto en generación como en visualización mobile.

### Librería principal: `@react-pdf/renderer`

Permite escribir los PDFs como componentes React con un sistema de estilos similar a CSS. Se genera en el servidor (API route) y se envía al cliente como descarga.

```
[Usuario pide reporte] → [API Route genera PDF] → [Descarga directa o vista previa]
```

### Arquitectura de reportes

```
src/
  lib/
    pdf/
      templates/                    # Templates reutilizables
        BaseReport.tsx              # Layout base: logo, header, footer, paginación
        TimesheetReport.tsx         # Reporte de horas
        ProgressReport.tsx          # Avance de obra con fotos
        BudgetReport.tsx            # Resumen de presupuesto
        InvoiceTemplate.tsx         # Factura / cobro
      components/                   # Componentes PDF reutilizables
        PDFHeader.tsx               # Logo + datos de empresa
        PDFTable.tsx                # Tabla genérica para PDFs
        PDFPhotoGrid.tsx            # Grid de fotos de avance
        PDFSignature.tsx            # Bloque de firma
      utils/
        formatters.ts               # Formateadores de moneda, fecha, etc.
        styles.ts                   # Estilos base compartidos
```

### Ejemplo de template base

```tsx
// src/lib/pdf/templates/BaseReport.tsx
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  logo: { width: 120, height: 40 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40,
            flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#888' },
});

export function BaseReport({ title, project, children }: BaseReportProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src="/logo.png" style={styles.logo} />
          <View>
            <Text>{project.name}</Text>
            <Text>{new Date().toLocaleDateString('es')}</Text>
          </View>
        </View>
        <Text style={styles.title}>{title}</Text>
        {children}
        <View style={styles.footer} fixed>
          <Text>Confidencial — {project.company}</Text>
          <Text render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          } />
        </View>
      </Page>
    </Document>
  );
}
```

### API Route para generar PDFs

```typescript
// src/app/api/reports/timesheet/route.ts
import { renderToBuffer } from '@react-pdf/renderer';
import { TimesheetReport } from '@/lib/pdf/templates/TimesheetReport';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const dateRange = searchParams.get('range');

  // Verificar permisos del usuario
  // Obtener datos del provider (Airtable o Supabase)
  const data = await getTimesheetProvider().getEntries(projectId, { dateRange });

  const buffer = await renderToBuffer(
    <TimesheetReport entries={data} project={project} />
  );

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="timesheet-${projectId}-${dateRange}.pdf"`,
    },
  });
}
```

### Componente de descarga/vista para mobile

```tsx
// src/components/reports/ReportButton.tsx
export function ReportButton({ reportType, projectId, filters }: ReportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const params = new URLSearchParams({ projectId, ...filters });
    const url = `/api/reports/${reportType}?${params}`;

    // En mobile: descarga directa (el navegador abre el PDF viewer nativo)
    // En desktop: abre en nueva pestaña para vista previa
    window.open(url, '_blank');
    setLoading(false);
  };

  return (
    <Button onClick={handleGenerate} disabled={loading} className="w-full md:w-auto">
      {loading ? <Spinner /> : <FileDown className="w-4 h-4 mr-2" />}
      Generar PDF
    </Button>
  );
}
```

### Tipos de reportes planificados

| Reporte | Datos | Incluye fotos | Audiencia |
|---|---|---|---|
| Timesheet semanal | Horas por empleado/proyecto | No | Admin, Manager |
| Avance de obra | % completado, hitos, fotos | Sí | Cliente, Admin |
| Resumen financiero | Costos vs presupuesto | No | CEO, Cliente |
| Punch list | Items pendientes con fotos | Sí | Cliente, Manager |
| Acta de reunión | Notas, acuerdos, responsables | No | Todos |
| Reporte de inspección | Checklist, fotos, observaciones | Sí | Cliente, Regulador |

### Notas sobre PDFs con fotos

Para reportes que incluyen fotos de obra (avance, punch list, inspecciones):
- Las imágenes se sirven desde **Supabase Storage** (ya cacheadas del proxy)
- `@react-pdf/renderer` soporta `<Image src={url} />` directamente
- Comprimir imágenes antes de incluir en PDF para mantener tamaño razonable
- Usar `sharp` (en API route) para redimensionar a máx 800px de ancho antes de inyectar al PDF

---

## 4. Solución al Problema de Imágenes de Airtable

Las URLs de imágenes de Airtable expiran cada ~2 horas. Esto causa recargas lentas.

### Estrategia: Proxy + Cache con Supabase Storage

```
[Airtable] → [Tu API Route /api/media/[id]] → [Supabase Storage bucket]
                                                      ↓
                                              [CDN de Supabase]
                                                      ↓
                                                [Tu Frontend]
```

**Flujo:**
1. Cuando se accede a una imagen por primera vez, tu API route la descarga de Airtable
2. La sube a Supabase Storage (bucket `project-media`)
3. Guarda la URL pública permanente de Supabase en una tabla de mapeo
4. Las siguientes peticiones sirven directamente desde Supabase Storage (CDN)
5. Un cron job opcional sincroniza imágenes nuevas de Airtable periódicamente

**Beneficio doble:** Cuando migres a Supabase, las imágenes YA estarán ahí.

---

## 5. Patrón de Abstracción para Migración Airtable → Supabase

Este es el patrón más importante del proyecto. Creas una **capa de servicio** (Data Access Layer) que abstrae de dónde vienen los datos.

### Estructura de archivos

```
src/
  lib/
    data/
      providers/
        airtable.ts        ← Implementación Airtable
        supabase.ts         ← Implementación Supabase (vacía al inicio)
      interfaces/
        timesheet.ts        ← Contrato/interfaz TypeScript
        projects.ts
        users.ts
      index.ts              ← Factory que decide qué provider usar
```

### Ejemplo de la interfaz

```typescript
// src/lib/data/interfaces/timesheet.ts
export interface TimesheetEntry {
  id: string;
  userId: string;
  projectId: string;
  date: string;
  hoursWorked: number;
  category: string;
  notes?: string;
}

export interface ITimesheetProvider {
  getEntries(projectId: string, filters?: TimesheetFilters): Promise<TimesheetEntry[]>;
  createEntry(entry: Omit<TimesheetEntry, 'id'>): Promise<TimesheetEntry>;
  updateEntry(id: string, data: Partial<TimesheetEntry>): Promise<TimesheetEntry>;
  deleteEntry(id: string): Promise<void>;
}
```

### Ejemplo del factory con feature flag

```typescript
// src/lib/data/index.ts
import { AirtableTimesheetProvider } from './providers/airtable';
import { SupabaseTimesheetProvider } from './providers/supabase';

const PROVIDER_CONFIG = {
  timesheet: process.env.NEXT_PUBLIC_TIMESHEET_PROVIDER || 'airtable', // 'airtable' | 'supabase'
  projects: process.env.NEXT_PUBLIC_PROJECTS_PROVIDER || 'airtable',
  // ... más módulos
};

export function getTimesheetProvider(): ITimesheetProvider {
  return PROVIDER_CONFIG.timesheet === 'supabase'
    ? new SupabaseTimesheetProvider()
    : new AirtableTimesheetProvider();
}
```

**Con esto, migrar un módulo es:**
1. Implementar el provider de Supabase
2. Cambiar la variable de entorno
3. Listo — sin tocar ni una línea de UI

---

## 6. Sistema de Autenticación y Permisos (RBAC)

### Modelo de datos de permisos

```
users (Supabase Auth)
  ├── id
  ├── email
  ├── name
  └── role: 'admin' | 'manager' | 'employee' | 'client'

user_permissions (tabla en Supabase)
  ├── user_id
  ├── resource: 'timesheet' | 'budgets' | 'documents' | 'schedules' | ...
  ├── project_id: string | null    ← null = acceso global, con ID = solo ese proyecto
  ├── access_level: 'read' | 'write' | 'admin'
  └── granted_by: user_id

projects (tabla en Supabase)
  ├── id
  ├── name
  ├── client_name
  ├── airtable_base_id            ← mapeo a la base de Airtable correspondiente
  └── status: 'active' | 'completed' | 'archived'
```

### Flujo del sistema

```
Login (Supabase Auth)
  → Middleware Next.js verifica sesión
    → API route consulta permisos del usuario
      → Frontend renderiza SOLO las opciones permitidas
        → Cada API route valida permisos antes de devolver datos
```

### Ejemplo del middleware

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}
```

### Ejemplo de vista condicional por permisos

```tsx
// Componente del menú principal
const navigation = allNavItems.filter(item =>
  userPermissions.some(p => p.resource === item.resource)
);

// El Journeyman123 solo ve "Timesheet - Construcción"
// El Admin ve todo
// El Cliente solo ve su proyecto con acceso read
```

---

## 7. Estrategia de Git y Deploy (Repositorio Único)

### Un solo repo, un solo deploy

Todo vive en un repositorio: API routes, frontend, capa de abstracción, templates PDF, tipos TypeScript. Vercel despliega todo junto automáticamente.

```
construction-platform/          ← Un solo repo en GitHub
├── src/app/api/                ← Tu "backend" (API routes de Next.js)
├── src/app/(dashboard)/        ← Tu "frontend" (páginas)
├── src/lib/data/               ← Capa de abstracción (providers)
├── src/lib/pdf/                ← Generación de PDFs (server-side)
└── src/components/             ← Componentes UI
```

**Ventaja clave:** cuando creas un feature como "Timesheet", el PR incluye el API route, el provider, el componente UI y los tipos — todo en un solo commit, un solo review, un solo deploy.

### Ramas

```
main (producción)                    → Vercel Production
  └── dev (staging/integración)      → Vercel Preview (auto)
        ├── feature/auth-login
        ├── feature/timesheet-crud
        ├── feature/admin-permissions
        └── bugfix/timesheet-date-fix
```

### Flujo de trabajo

1. Creas `feature/XXX` desde `dev`
2. Desarrollas y haces commits
3. Push → Vercel genera Preview URL automática (puedes compartir para feedback)
4. PR a `dev` → revisas → merge
5. Cuando `dev` está estable → PR a `main` → producción

### Configuración Vercel

- **Production branch:** `main`
- **Preview branches:** todas las demás (automático)
- **Environment variables:** diferentes por entorno (Airtable keys, Supabase keys, feature flags)

---

## 8. Estructura del Proyecto

```
construction-platform/
├── .env.local                      # Variables locales (no se sube a git)
├── .env.example                    # Template de variables
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── public/
│   └── logo.svg
│
├── src/
│   ├── app/                        # App Router de Next.js
│   │   ├── (auth)/                 # Grupo de rutas públicas
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/            # Grupo de rutas protegidas
│   │   │   ├── layout.tsx          # Sidebar + header + auth check
│   │   │   ├── page.tsx            # Home / Overview
│   │   │   ├── timesheet/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [projectId]/
│   │   │   │       └── page.tsx
│   │   │   ├── admin/
│   │   │   │   ├── users/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── permissions/
│   │   │   │       └── page.tsx
│   │   │   └── projects/
│   │   │       ├── page.tsx
│   │   │       └── [projectId]/
│   │   │           └── page.tsx
│   │   │
│   │   └── api/                    # API Routes
│   │       ├── auth/
│   │       ├── timesheet/
│   │       ├── media/
│   │       │   └── [id]/
│   │       │       └── route.ts    # Proxy de imágenes
│   │       ├── reports/
│   │       │   └── [type]/
│   │       │       └── route.ts    # Generación de PDFs por tipo
│   │       └── admin/
│   │
│   ├── lib/
│   │   ├── data/                   # ← Capa de abstracción (Sección 3)
│   │   │   ├── providers/
│   │   │   ├── interfaces/
│   │   │   └── index.ts
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser client
│   │   │   ├── server.ts           # Server client
│   │   │   └── middleware.ts
│   │   ├── airtable/
│   │   │   └── client.ts           # Configuración de Airtable
│   │   ├── pdf/                    # Sistema de reportes PDF
│   │   │   ├── templates/          # TimesheetReport, ProgressReport, etc.
│   │   │   ├── components/         # PDFHeader, PDFTable, PDFPhotoGrid
│   │   │   └── utils/              # Estilos base, formatters
│   │   └── utils/
│   │       ├── permissions.ts
│   │       └── helpers.ts
│   │
│   ├── hooks/
│   │   ├── usePermissions.ts
│   │   ├── useTimesheet.ts
│   │   ├── useCurrentProject.ts
│   │   ├── useDeviceContext.ts     # Mobile/Tablet/Desktop detection
│   │   └── useMediaQuery.ts        # Base media query hook
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── AppShell.tsx        # Layout maestro: sidebar (desktop) + bottom nav (mobile)
│   │   │   ├── Sidebar.tsx         # Solo desktop
│   │   │   ├── BottomNav.tsx       # Solo mobile
│   │   │   ├── Header.tsx
│   │   │   ├── PermissionGate.tsx  # Wrapper que oculta si no hay permiso
│   │   │   ├── MobileOnly.tsx      # Wrapper para features exclusivos de mobile
│   │   │   └── DesktopOnly.tsx     # Wrapper para features exclusivos de desktop
│   │   ├── timesheet/
│   │   │   ├── TimesheetTable.tsx   # Vista desktop
│   │   │   ├── TimesheetCards.tsx   # Vista mobile (cards apiladas)
│   │   │   ├── TimesheetView.tsx    # Elige Table o Cards según dispositivo
│   │   │   ├── TimesheetForm.tsx
│   │   │   └── TimesheetFilters.tsx
│   │   ├── reports/
│   │   │   ├── ReportButton.tsx     # Botón generar/descargar PDF
│   │   │   └── ReportSelector.tsx   # Selector de tipo de reporte + filtros
│   │   └── admin/
│   │       ├── UserList.tsx
│   │       └── PermissionEditor.tsx
│   │
│   └── types/
│       ├── auth.ts
│       ├── timesheet.ts
│       └── permissions.ts
```

---

## 9. Librerías Exactas (package.json)

```json
{
  "dependencies": {
    "next": "^14.2",
    "@supabase/supabase-js": "^2.x",
    "@supabase/auth-helpers-nextjs": "^0.10",
    "@supabase/ssr": "^0.5",
    "airtable": "^0.12",
    "@tanstack/react-query": "^5.x",
    "@tanstack/react-table": "^8.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "zod": "^3.x",
    "tailwindcss": "^3.4",
    "class-variance-authority": "^0.7",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "lucide-react": "^0.400",
    "date-fns": "^3.x",
    "sonner": "^1.x",
    "@react-pdf/renderer": "^3.x",
    "sharp": "^0.33",
    "@use-gesture/react": "^10.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^18.x",
    "eslint": "^8.x",
    "eslint-config-next": "^14.x",
    "prettier": "^3.x"
  }
}
```

**Librerías nuevas explicadas:**
- **`@react-pdf/renderer`** — Genera PDFs como componentes React. Se ejecuta en el servidor (API routes). Soporta imágenes, tablas, paginación, estilos avanzados.
- **`sharp`** — Compresión/redimensionamiento de imágenes antes de meterlas en PDFs. Evita PDFs de 50MB por fotos de obra sin comprimir.
- **`@use-gesture/react`** — Gestos touch (swipe, pull-to-refresh) para interacciones mobile nativas.

**Nota sobre `airtable` npm:** La librería oficial es funcional pero básica. Alternativa recomendada: usar `fetch` directamente contra la Airtable REST API desde tus API routes, así controlas mejor el tipado y la paginación.

---

## 10. Fases de Implementación

### FASE 0 — Scaffolding (1-2 días)

- [ ] `npx create-next-app@latest` con TypeScript + Tailwind + App Router
- [ ] Instalar todas las dependencias
- [ ] Configurar estructura de carpetas
- [ ] Inicializar Git con ramas `main` y `dev`
- [ ] Conectar a Vercel (deploy automático)
- [ ] Configurar Supabase project (auth + storage + tablas de permisos)
- [ ] Configurar variables de entorno en Vercel (dev y production)
- [ ] Setup de shadcn/ui (`npx shadcn-ui@latest init`)
- [ ] Crear el `<AppShell>` base: sidebar (desktop) + bottom nav (mobile)
- [ ] Configurar breakpoints Tailwind para mobile-first

### FASE 1 — Auth + Permisos + Shell (3-5 días)

- [ ] Página de login mobile-first (email + password con Supabase Auth)
- [ ] Middleware de protección de rutas
- [ ] Crear tablas en Supabase: `user_profiles`, `user_permissions`, `projects`
- [ ] Panel admin: CRUD de usuarios
- [ ] Panel admin: asignar permisos por recurso y proyecto
- [ ] Componente `<PermissionGate>` para renderizado condicional
- [ ] Componentes `<MobileOnly>` y `<DesktopOnly>`
- [ ] Hook `usePermissions()` para lógica de permisos en el cliente
- [ ] Hook `useDeviceContext()` para detección de dispositivo
- [ ] Dashboard home con navegación dinámica según permisos
- [ ] Crear la capa de abstracción de datos (interfaces + factory)

### FASE 2 — Timesheet con Airtable (5-7 días)

- [ ] Implementar `AirtableTimesheetProvider`
- [ ] Configurar TanStack Query para fetching y cache
- [ ] Vista mobile: cards apiladas con swipe actions
- [ ] Vista desktop: tabla con filtros por semana/proyecto
- [ ] Componente `<TimesheetView>` que elige vista según dispositivo
- [ ] Formulario de ingreso de horas (React Hook Form + Zod), optimizado para mobile
- [ ] Vista por proyecto (solo datos del proyecto del usuario)
- [ ] Vista admin: resumen de horas por empleado/proyecto
- [ ] **Reporte PDF de timesheet** (primer template PDF)
- [ ] Exportar a CSV (funcionalidad básica)

### FASE 3 — Proxy de Imágenes (2-3 días)

- [ ] API route `/api/media/[id]` para proxy
- [ ] Bucket en Supabase Storage (`project-media`)
- [ ] Tabla de mapeo `media_cache` (airtable_url → supabase_url)
- [ ] Lógica: si existe en cache → servir de Supabase, si no → descargar, subir, cachear
- [ ] Componente `<CachedImage>` que usa el proxy automáticamente

### FASE 4 — Migración progresiva a Supabase (por módulo)

Para cada módulo nuevo:
1. Diseñar schema en Supabase (PostgreSQL)
2. Implementar el `SupabaseXXXProvider`
3. Migrar datos históricos de Airtable con un script
4. Cambiar feature flag del módulo a `'supabase'`
5. Validar en `dev` → promover a `main`
6. Timesheet sería el primer módulo a migrar completamente

### FASE 5+ — Funcionalidades futuras

- Presupuestos y control de costos (con PDF de resumen financiero)
- Gestión documental (planos, contratos, permisos)
- Cronograma de obra
- Portal de cliente (vista limitada mobile-first con PDFs de avance)
- Reportes de inspección y punch list (con fotos, PDF)
- Notificaciones (email/push)
- Funcionalidades exclusivas mobile: fichaje rápido en obra, captura de fotos de avance
- PWA (Progressive Web App) para instalar en teléfono sin app store

---

## 11. Notas Importantes para Desarrollador Solo

1. **No construyas todo de una vez.** Cada fase es un entregable funcional que ya aporta valor.

2. **Usa Vercel Preview URLs** para que stakeholders vean progreso sin tocar producción.

3. **La capa de abstracción es tu inversión más importante.** Dedicarle tiempo al inicio te ahorrará semanas después.

4. **Supabase Auth desde el día 1** — no uses la auth de Airtable ni construyas la tuya. Supabase Auth es gratuita, probada, y ya la necesitas para el futuro.

5. **Supabase Storage desde el día 1** — resuelve el problema de imágenes inmediatamente y empieza a poblar tu almacenamiento final.

6. **TanStack Query es crítico** — como desarrollador solo, el cache automático, la deduplicación de requests, y los loading/error states te ahorran MUCHO código.

7. **Para las 10 bases de Airtable:** crea un mapeo `project → airtable_base_id` en Supabase. Tu provider de Airtable consulta este mapeo para saber a qué base conectarse por proyecto.

8. **Row Level Security (RLS) en Supabase** — cuando migres datos, Supabase te permite definir políticas a nivel de fila. Ejemplo: "un usuario solo puede ver timesheets de proyectos donde tiene permiso". Esto da seguridad a nivel de base de datos, no solo de UI.

9. **Convención de commits:** usa Conventional Commits (`feat:`, `fix:`, `chore:`) para mantener historial limpio.

10. **Mobile first no es opcional** — Cada componente nuevo se prueba primero en Chrome DevTools con viewport de 375px (iPhone SE). Si se ve bien ahí, se expande a desktop. Nunca al revés.

11. **PDFs como inversión de confianza** — Los clientes de construcción de lujo valoran reportes profesionales. Dedicar tiempo a que el `BaseReport.tsx` tenga buen branding (logo, tipografía, colores corporativos) paga dividendos enormes en percepción de profesionalismo.

12. **`sharp` en Vercel** — Vercel soporta `sharp` nativamente en API routes (serverless). No necesitas configuración extra. Úsalo para comprimir fotos antes de inyectarlas en PDFs.
