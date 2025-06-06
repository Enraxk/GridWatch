/**
 * @fileoverview
 * MoveIcon component renders a draggable icon using the GripHorizontal icon from lucide-react.
 * Used to indicate draggable UI elements.
 */

import { GripHorizontal } from 'lucide-react';

/**
 * MoveIcon component displays a horizontal grip icon centered within its container.
 * The icon is typically used as a visual indicator for drag-and-drop functionality.
 *
 * @returns {JSX.Element} The rendered MoveIcon component.
 */
const MoveIcon = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', cursor: 'move' }} className="move-icon">
        <GripHorizontal />
    </div>
);

export default MoveIcon;