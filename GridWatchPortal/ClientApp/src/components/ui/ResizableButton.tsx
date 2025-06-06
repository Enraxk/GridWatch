/**
 * @fileoverview
 * ResizableButton component for toggling the resizable state of a card in a layout.
 * 
 * Props:
 * - cardId: string - The unique identifier for the card.
 * - layout: any[] - The current layout array containing card objects.
 * - setLayout: (layout: any[]) => void - Function to update the layout state.
 */

import resizeIcon from "@/assets/expandsquare-expand-arrow-direction-move-arrows-svgrepo-com.svg";

/**
 * Renders a button that toggles the resizable state of a card in the layout.
 * 
 * @param {Object} props - The component props.
 * @param {string} props.cardId - The unique identifier for the card.
 * @param {any[]} props.layout - The current layout array.
 * @param {(layout: any[]) => void} props.setLayout - Function to update the layout.
 * @returns {JSX.Element} The rendered button component.
 */
const ResizableButton = ({ cardId, layout, setLayout }: { cardId: string, layout: any[], setLayout: (layout: any[]) => void }) => {
    /**
     * Toggles the isResizable property of the card with the given cardId.
     * 
     * @param {string} cardId - The unique identifier for the card.
     */
    const toggleCardResizable = (cardId: any) => {
        setLayout(layout.map((card: { i: any; isResizable: any }) =>
            card.i === cardId ? { ...card, isResizable: !card.isResizable } : card
        ));
    };

    return (
        <button
            onClick={() => toggleCardResizable(cardId)}
            style={{ cursor: 'pointer', position: 'absolute', top: '20px', right: '50px', background: 'none', border: 'none', padding: 0 }}
        >
            <img
                src={resizeIcon}
                alt="Resize"
                className="resize-icon"
            />  
        </button>
    );
};

export default ResizableButton;