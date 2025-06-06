/**
 * @fileOverview ToolBar component for GridWatch Portal
 * Provides a configurable, drag-and-drop toolbar with various controls.
 */
import * as React from "react";
import { memo, useCallback, useState, useEffect } from "react";
import { Scaling, Pin, RefreshCw } from 'lucide-react';
import { ToolbarButton } from "@/components/ui/ToolBar/ToolBarButton.tsx";
import { Clock } from "@/components/ui/Clock";
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';

// Storage key for toolbar items order
const TOOLBAR_ORDER_KEY = 'gridwatch-toolbar-order';

/**
 * Interface defining a toolbar item structure
 * @interface ToolbarItem
 * @property {string} id - Unique identifier for the toolbar item
 * @property {React.ReactNode} component - The React component to render for this item
 */
interface ToolbarItem {
    id: string;
    component: React.ReactNode;
}

/**
 * Sortable item wrapper component that enables drag and drop functionality
 *
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the sortable item
 * @param {React.ReactNode} props.children - Child components to render inside the sortable container
 * @returns {JSX.Element} - Draggable container with the children
 */
const SortableItem = ({ id, children }: { id: string, children: React.ReactNode }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'grab',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
};

/**
 * Interface for ToolBar component props
 *
 * @interface ToolBarProps
 * @property {boolean} isResizable - Whether card resizing is enabled
 * @property {React.Dispatch<React.SetStateAction<boolean>>} setIsResizable - Function to toggle resize state
 * @property {boolean} [showPinButtons] - Whether pin buttons are visible
 * @property {React.Dispatch<React.SetStateAction<boolean>>} [setShowPinButtons] - Function to toggle pin buttons visibility
 * @property {() => void} [refreshCards] - Function to refresh dashboard cards without full page reload
 */
interface ToolBarProps {
    isResizable: boolean;
    setIsResizable: React.Dispatch<React.SetStateAction<boolean>>;
    showPinButtons?: boolean;
    setShowPinButtons?: React.Dispatch<React.SetStateAction<boolean>>;
    refreshCards?: () => void;
}

/**
 * ToolBar component provides a configurable, drag-and-drop toolbar with various controls
 * for the GridWatch dashboard. Supports rearranging items and persisting layout to localStorage.
 *
 * @param {ToolBarProps} props - Component props
 * @returns {JSX.Element} - Rendered toolbar with draggable items
 */
const ToolBar = memo(function ToolDashboardBar({
                                                   isResizable,
                                                   setIsResizable,
                                                   showPinButtons = true,
                                                   setShowPinButtons,
                                                   refreshCards
                                               }: ToolBarProps) {
    /**
     * Toggles the resize capability for dashboard cards
     */
    const handleToggleResize = useCallback(() => {
        setIsResizable(prevState => !prevState);
    }, [setIsResizable]);

    /**
     * Toggles the visibility of pin buttons on dashboard cards
     */
    const handleTogglePinButtons = useCallback(() => {
        if (setShowPinButtons) {
            setShowPinButtons(prevState => !prevState);
        }
    }, [setShowPinButtons]);

    /**
     * Refreshes dashboard cards or reloads the page if refresh function not available
     */
    const handleRefresh = useCallback(() => {
        if (refreshCards) {
            refreshCards();
        } else {
            window.location.reload();
        }
    }, [refreshCards]);

    // Define left and right toolbar items
    const defaultLeftItems: ToolbarItem[] = [
        { id: 'clock', component: <Clock /> }
    ];

    const defaultRightItems: ToolbarItem[] = [
        { id: 'reload', component:
                <ToolbarButton onClick={handleRefresh} title={refreshCards ? "Refresh Cards" : "Reload"}>
                    <RefreshCw className="h-4 w-4" />
                </ToolbarButton>
        },
        { id: 'resize', component:
                <ToolbarButton onClick={handleToggleResize} title={isResizable ? "Disable Resize" : "Enable Resize"}>
                    <Scaling className="h-4 w-4" />
                </ToolbarButton>
        },
        ...(setShowPinButtons ? [{ id: 'pin', component:
                <ToolbarButton onClick={handleTogglePinButtons} title={showPinButtons ? "Hide Pin Buttons" : "Show Pin Buttons"}>
                    <Pin className="h-4 w-4" />
                </ToolbarButton>
        }] : [])
    ];

    /**
     * State for left toolbar items - initialized from localStorage if available
     */
    const [leftItems, setLeftItems] = useState<ToolbarItem[]>(() => {
        try {
            const saved = localStorage.getItem(`${TOOLBAR_ORDER_KEY}-left`);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Map saved IDs back to full items
                return parsed.map((id: string) =>
                    defaultLeftItems.find(item => item.id === id) ||
                    defaultRightItems.find(item => item.id === id)
                ).filter(Boolean);
            }
        } catch (e) {
            console.error("Error loading toolbar order:", e);
        }
        return defaultLeftItems;
    });

    /**
     * State for right toolbar items - initialized from localStorage if available
     */
    const [rightItems, setRightItems] = useState<ToolbarItem[]>(() => {
        try {
            const saved = localStorage.getItem(`${TOOLBAR_ORDER_KEY}-right`);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Map saved IDs back to full items
                return parsed.map((id: string) =>
                    defaultLeftItems.find(item => item.id === id) ||
                    defaultRightItems.find(item => item.id === id)
                ).filter(Boolean);
            }
        } catch (e) {
            console.error("Error loading toolbar order:", e);
        }
        return defaultRightItems;
    });

    // Save to localStorage when left items order changes
    useEffect(() => {
        localStorage.setItem(
            `${TOOLBAR_ORDER_KEY}-left`,
            JSON.stringify(leftItems.map(item => item.id))
        );
    }, [leftItems]);

    // Save to localStorage when right items order changes
    useEffect(() => {
        localStorage.setItem(
            `${TOOLBAR_ORDER_KEY}-right`,
            JSON.stringify(rightItems.map(item => item.id))
        );
    }, [rightItems]);

    // Configure sensors for drag and drop interaction
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Require minimum drag distance before activating
            },
        })
    );

    /**
     * Handles drag end events for left toolbar items
     * Updates the order of items based on drag result
     *
     * @param {DragEndEvent} event - Drag end event from dnd-kit
     */
    const handleDragEndLeft = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = leftItems.findIndex(item => item.id === active.id);
            const newIndex = leftItems.findIndex(item => item.id === over.id);

            const newItems = [...leftItems];
            const [movedItem] = newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, movedItem);

            setLeftItems(newItems);
        }
    };

    /**
     * Handles drag end events for right toolbar items
     * Updates the order of items based on drag result
     *
     * @param {DragEndEvent} event - Drag end event from dnd-kit
     */
    const handleDragEndRight = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = rightItems.findIndex(item => item.id === active.id);
            const newIndex = rightItems.findIndex(item => item.id === over.id);

            const newItems = [...rightItems];
            const [movedItem] = newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, movedItem);

            setRightItems(newItems);
        }
    };

    return (
        <div className="flex items-center justify-between py-1 px-3 rounded bg-sidebar text-sidebar-foreground">
            <DndContext sensors={sensors} onDragEnd={handleDragEndLeft} modifiers={[restrictToHorizontalAxis]}>
                <div className="flex items-center gap-4">
                    <SortableContext items={leftItems.map(item => item.id)} strategy={horizontalListSortingStrategy}>
                        {leftItems.map((item) => (
                            <SortableItem key={item.id} id={item.id}>
                                {item.component}
                            </SortableItem>
                        ))}
                    </SortableContext>
                </div>
            </DndContext>

            <DndContext sensors={sensors} onDragEnd={handleDragEndRight} modifiers={[restrictToHorizontalAxis]}>
                <div className="flex items-center gap-2">
                    <SortableContext items={rightItems.map(item => item.id)} strategy={horizontalListSortingStrategy}>
                        {rightItems.map((item) => (
                            <SortableItem key={item.id} id={item.id}>
                                {item.component}
                            </SortableItem>
                        ))}
                    </SortableContext>
                </div>
            </DndContext>
        </div>
    );
});

export { ToolBar };