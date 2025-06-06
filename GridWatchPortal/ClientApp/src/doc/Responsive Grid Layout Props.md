# Responsive Grid Layout Props

## Breakpoints

- **breakpoints**: `?Object = {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}`
    - {name: pxVal}, e.g. `{lg: 1200, md: 996, sm: 768, xs: 480}`. Breakpoint names are arbitrary but must match in the
      cols and layouts objects.

- **cols**: `?Object = {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}`
    - # of cols. This is a breakpoint -> cols map, e.g. `{lg: 12, md: 10, ...}`.

## Layout

- **margin**: `[number, number] | {[breakpoint: $Keys<breakpoints>]: [number, number]}`
    - Margin (in pixels). Can be specified either as horizontal and vertical margin, e.g. `[10, 10]` or as a
      breakpoint -> margin map, e.g. `{lg: [10, 10], md: [10, 10], ...}`.

- **containerPadding**: `[number, number] | {[breakpoint: $Keys<breakpoints>]: [number, number]}`
    - Container padding (in pixels). Can be specified either as horizontal and vertical padding, e.g. `[10, 10]` or as a
      breakpoint -> containerPadding map, e.g. `{lg: [10, 10], md: [10, 10], ...}`.

- **layouts**: `{[key: $Keys<breakpoints>]: Layout}`
    - Layouts is an object mapping breakpoints to layouts. e.g. `{lg: Layout, md: Layout, ...}`.

## Callbacks

- **onBreakpointChange**: `(newBreakpoint: string, newCols: number) => void`
    - Calls back with breakpoint and new # cols.

- **onLayoutChange**: `(currentLayout: Layout, allLayouts: {[key: $Keys<breakpoints>]: Layout}) => void`
    - Callback so you can save the layout. AllLayouts are keyed by breakpoint.

- **onWidthChange**:
  `(containerWidth: number, margin: [number, number], cols: number, containerPadding: [number, number]) => void`
    - Callback when the width changes, so you can modify the layout as needed.
