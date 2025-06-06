/**
 * @fileoverview
 * Grid Card Component System for dashboard grid layouts.
 *
 * This file defines a composable card system with the following features:
 * - Drag and drop functionality for rearranging cards.
 * - Pinning and unpinning cards to specific locations.
 * - Consistent styling and structure for dashboard cards.
 *
 * Components exported:
 * - GridCard: Main card container with drag-and-drop support.
 * - GridCardHeader: Header section for title, description, and actions.
 * - GridCardTitle: Title text for the card.
 * - GridCardDescription: Description text, typically below the title.
 * - GridCardAction: Action area, usually in the top-right corner.
 * - GridCardContent: Main content area of the card.
 * - GridCardFooter: Footer section, includes move handle if draggable.
 *
 * Usage example:
 * <GridCard key="chartCard" cardId="chartCard" layout={layout} setLayout={setLayout}>
 *   <GridCardTitle>Revenue Chart</GridCardTitle>
 *   <GridCardDescription>Monthly revenue breakdown</GridCardDescription>
 *   <GridCardContent>
 *     <RevenueChart />
 *   </GridCardContent>
 *   <GridCardFooter>
 *     <MetricSummary value="5.2%" label="increase" />
 *   </GridCardFooter>
 * </GridCard>
 */

import * as React from "react";
import { useMemo, memo } from "react";
import { cn } from "@/lib/utils";
import MoveIcon from "@/components/ui/MoveIcon.tsx";
import DraggableButton from "@/components/ui/DraggableButton.tsx";

/**
 * Base props type for all card components
 */
type CardComponentProps = React.ComponentProps<"div"> & {
    className?: string;
};

/**
 * Props for the main GridCard component
 * @property {string} cardId - Unique identifier that matches an item in the layout array
 * @property {Array} layout - The grid layout array from react-grid-layout
 * @property {Function} setLayout - Function to update the layout state
 * @property {boolean} [showPinButtons=true] - Whether to show pin/unpin buttons
 */
interface GridCardProps extends CardComponentProps {
    cardId: string;
    layout: Array<{i: string; isDraggable?: boolean; [key: string]: any}>;
    setLayout: (layout: any[]) => void;
    showPinButtons?: boolean;
}

/**
 * Header component for GridCard - contains title, description and actions
 */
const GridCardHeader = memo(({ className, ...props }: CardComponentProps) => (
    <div
        data-slot="card-header"
        className={cn(
            "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
            className
        )}
        {...props}
    />
));

/**
 * Title component for GridCard
 */
const GridCardTitle = memo(({ className, ...props }: CardComponentProps) => (
    <div
        data-slot="card-title"
        className={cn("leading-none font-semibold", className)}
        {...props}
    />
));

/**
 * Description component for GridCard - typically placed below the title
 */
const GridCardDescription = memo(({ className, ...props }: CardComponentProps) => (
    <div
        data-slot="card-description"
        className={cn("text-muted-foreground text-sm", className)}
        {...props}
    />
));

/**
 * Action component for GridCard - typically placed in the top-right corner
 */
const GridCardAction = memo(({ className, ...props }: CardComponentProps) => (
    <div
        data-slot="card-action"
        className={cn(
            "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
            className
        )}
        {...props}
    />
));

/**
 * Content component for GridCard - main content area
 */
const GridCardContent = memo(({ className, ...props }: CardComponentProps) => (
    <div
        data-slot="card-content"
        className={cn("px-6", className)}
        {...props}
    />
));

/**
 * Footer component for GridCard - appears at the bottom of the card
 * Contains the move handle when card is draggable
 */
const GridCardFooter = memo(({ className, ...props }: CardComponentProps) => (
    <div
        data-slot="card-footer"
        className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
        {...props}
    />
));

/**
 * Main GridCard component
 *
 * Provides a container with drag-and-drop functionality for dashboard items.
 * Used with react-grid-layout to create responsive dashboard layouts.
 *
 * The cardId must match an item's 'i' property in the layout array.
 * Draggability is determined by the isDraggable property of the matching layout item.
 */
const GridCard = memo(function GridCard({
                                            className,
                                            cardId,
                                            layout,
                                            setLayout,
                                            showPinButtons = true,
                                            children,
                                            ...props
                                        }: GridCardProps) {
    // Efficiently determine if card is draggable based on layout configuration
    const { cardItem, isDraggable } = useMemo(() => {
        const item = layout.find((item) => item.i === cardId);
        return {
            cardItem: item,
            isDraggable: item?.isDraggable !== false
        };
    }, [layout, cardId]);

    return (
        <div
            className={cn(
                "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
                className
            )}
            {...props}
        >
            <GridCardHeader>
                {showPinButtons && (
                    <DraggableButton cardId={cardId} layout={layout} setLayout={setLayout} />
                )}
                {children}
            </GridCardHeader>
            <GridCardFooter>
                {isDraggable && <MoveIcon />}
            </GridCardFooter>
        </div>
    );
});

export {
    GridCard,
    GridCardHeader,
    GridCardFooter,
    GridCardTitle,
    GridCardAction,
    GridCardDescription,
    GridCardContent,
};