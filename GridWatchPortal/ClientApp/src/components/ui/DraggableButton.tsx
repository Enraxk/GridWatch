/**
 * @fileoverview
 * DraggableButton is a React component that renders a button to toggle the draggable state
 * of a dashboard card. It displays a pin icon when the card is draggable and a pin-off icon
 * when the card is locked. The button updates the layout state to reflect the draggable status.
 */

import { Pin, PinOff } from 'lucide-react';

/**
 * Props for DraggableButton component.
 * @typedef {Object} DraggableButtonProps
 * @property {string} cardId - The unique identifier for the card.
 * @property {any[]} layout - The current layout array containing card configurations.
 * @property {(layout: any[]) => void} setLayout - Function to update the layout state.
 */

/**
 * DraggableButton component for toggling the draggable state of a card.
 *
 * @param {DraggableButtonProps} props - The props for the component.
 * @returns {JSX.Element} The rendered button element.
 */
const DraggableButton = ({ cardId, layout, setLayout }: { cardId: string, layout: any[], setLayout: (layout: any[]) => void }) => {
    const cardItem = layout.find((item) => item.i === cardId);
    const isDraggable = cardItem?.isDraggable !== false; // Default to true if not defined

    /**
     * Toggles the draggable state of the card with the given cardId.
     * @param {string} cardId - The unique identifier for the card.
     */
    const toggleCardDraggable = (cardId: string) => {
        setLayout(layout.map((card) =>
            card.i === cardId ? { ...card, isDraggable: !isDraggable } : card
        ));
    };

    return (
        <button
            onClick={() => toggleCardDraggable(cardId)}
            style={{ cursor: 'pointer', position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', padding: 0 }}
            title={isDraggable ? "Lock position" : "Unlock position"}
        >
            {isDraggable ? <Pin /> : <PinOff />}
        </button>
    );
};

export default DraggableButton;