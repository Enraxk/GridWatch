
# Grid Layout Props

## Basic Props

- **width**: `number`
  - This allows setting the initial width on the server side. This is required unless using the HOC `<WidthProvider>` or similar.

- **autoSize**: `?boolean = true`
  - If true, the container height swells and contracts to fit contents.

- **cols**: `?number = 12`
  - Number of columns in this layout.

- **draggableCancel**: `?string = ''`
  - A CSS selector for tags that will not be draggable. For example: `draggableCancel:'.MyNonDraggableAreaClassName'`. If you forget the leading `.` it will not work. `.react-resizable-handle` is always prepended to this value.

- **draggableHandle**: `?string = ''`
  - A CSS selector for tags that will act as the draggable handle. For example: `draggableHandle:'.MyDragHandleClassName'`. If you forget the leading `.` it will not work.

- **compactType**: `?('vertical' | 'horizontal' | null) = 'vertical'`
  - Compaction type.

- **layout**: `?Array<{i?: string, x: number, y: number, w: number, h: number}> = null`
  - Layout is an array of objects with the format. The index into the layout must match the key used on each item component. If you choose to use custom keys, you can specify that key in the layout array objects using the `i` prop. If not provided, use data-grid props on children.

- **margin**: `?[number, number] = [10, 10]`
  - Margin between items [x, y] in px.

- **containerPadding**: `?[number, number] = margin`
  - Padding inside the container [x, y] in px.

- **rowHeight**: `?number = 150`
  - Rows have a static height, but you can change this based on breakpoints if you like.

- **droppingItem**: `?{ i: string, w: number, h: number }`
  - Configuration of a dropping element. Dropping element is a "virtual" element which appears when you drag over some element from outside. It can be changed by passing specific parameters: `i` - id of an element, `w` - width of an element, `h` - height of an element.

## Flags

- **isDraggable**: `?boolean = true`
  - If true, items are draggable.

- **isResizable**: `?boolean = true`
  - If true, items are resizable.

- **isBounded**: `?boolean = false`
  - If true, items are bounded.

- **useCSSTransforms**: `?boolean = true`
  - Uses CSS3 translate() instead of position top/left. This makes about 6x faster paint performance.

- **transformScale**: `?number = 1`
  - If parent DOM node of ResponsiveReactGridLayout or ReactGridLayout has "transform: scale(n)" css property, we should set scale coefficient to avoid render artefacts while dragging.

- **allowOverlap**: `?boolean = false`
  - If true, grid can be placed one over the other. If set, implies `preventCollision`.

- **preventCollision**: `?boolean = false`
  - If true, grid items won't change position when being dragged over. If `allowOverlap` is still false, this simply won't allow one to drop on an existing object.

- **isDroppable**: `?boolean = false`
  - If true, droppable elements (with `draggable={true}` attribute) can be dropped on the grid. It triggers "onDrop" callback with position and event object as parameters. It can be useful for dropping an element in a specific position.

- **resizeHandles**: `?Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'> = ['se']`
  - Defines which resize handles should be rendered. Allows for any combination of: 's' - South handle (bottom-center), 'w' - West handle (left-center), 'e' - East handle (right-center), 'n' - North handle (top-center), 'sw' - Southwest handle (bottom-left), 'nw' - Northwest handle (top-left), 'se' - Southeast handle (bottom-right), 'ne' - Northeast handle (top-right). Note that changing this property dynamically does not work due to a restriction in react-resizable.

- **resizeHandle**: `?ReactElement<any> | ((resizeHandleAxis: ResizeHandleAxis, ref: ReactRef<HTMLElement>) => ReactElement<any>)`
  - Custom component for resize handles. See `handle` as used in https://github.com/react-grid-layout/react-resizable#resize-handle. Your component should have the class `.react-resizable-handle`, or you should add your custom class to the `draggableCancel` prop.

## Callbacks

- **onLayoutChange**: `(layout: Layout) => void`
  - Callback so you can save the layout. Calls back with (currentLayout) after every drag or resize stop.

- **ItemCallback**: `(layout: Layout, oldItem: LayoutItem, newItem: LayoutItem, placeholder: LayoutItem, e: MouseEvent, element: HTMLElement) => void`
  - All callbacks below have signature (layout, oldItem, newItem, placeholder, e, element). 'start' and 'stop' callbacks pass `undefined` for 'placeholder'.

- **onDragStart**: `ItemCallback`
  - Calls when drag starts.

- **onDrag**: `ItemCallback`
  - Calls on each drag movement.

- **onDragStop**: `ItemCallback`
  - Calls when drag is complete.

- **onResizeStart**: `ItemCallback`
  - Calls when resize starts.

- **onResize**: `ItemCallback`
  - Calls when resize movement happens.

- **onResizeStop**: `ItemCallback`
  - Calls when resize is complete.

## Dropover Functionality

- **onDrop**: `(layout: Layout, item: ?LayoutItem, e: Event) => void`
  - Calls when an element has been dropped into the grid from outside.

- **onDropDragOver**: `(e: DragOverEvent) => ?({|w?: number, h?: number|} | false)`
  - Calls when an element is being dragged over the grid from outside as above. This callback should return an object to dynamically change the droppingItem size. Return false to short-circuit the dragover.

- **innerRef**: `{current: null | HTMLDivElement}`
  - Ref for getting a reference for the grid's wrapping div. You can use this instead of a regular ref and the deprecated `ReactDOM.findDOMNode()` function. Note that this type is React.Ref<HTMLDivElement> in TypeScript, Flow has a bug here https://github.com/facebook/flow/issues/8671#issuecomment-862634865.
