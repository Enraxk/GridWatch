/**
 * @fileoverview
 * AspectRatio component wraps Radix UI's AspectRatioPrimitive.Root,
 * providing a consistent aspect ratio for its children.
 * 
 * Usage:
 *   <AspectRatio ratio={16 / 9}>
 *     <img src="..." alt="..." />
 *   </AspectRatio>
 */

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

/**
 * AspectRatio component props are inherited from Radix UI's AspectRatioPrimitive.Root.
 * Renders a container that maintains a consistent aspect ratio.
 *
 * @param props - Props passed to the underlying AspectRatioPrimitive.Root component.
 * @returns JSX.Element
 */
function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }