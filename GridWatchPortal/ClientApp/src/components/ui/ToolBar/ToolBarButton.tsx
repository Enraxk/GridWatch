/**
 * @fileoverview
 * ToolbarButton is a reusable button component for toolbars in the UI.
 * It wraps the base Button component with specific styling and props.
 * 
 * Props:
 * - onClick: Function to call when the button is clicked.
 * - title: Tooltip text for the button.
 * - children: Icon or content to display inside the button.
 */

import * as React from "react";
import { Button } from "@/components/ui/button";

interface ToolbarButtonProps {
    /** Function to call when the button is clicked */
    onClick: () => void;
    /** Tooltip text for the button */
    title: string;
    /** Icon or content to display inside the button */
    children: React.ReactNode;
}

/**
 * Renders a toolbar button with a ghost variant and small size.
 * @param onClick - Click handler for the button.
 * @param title - Tooltip text for accessibility.
 * @param children - Content to display inside the button.
 */
export function ToolbarButton({
                                  onClick,
                                  title,
                                  children,
                              }: ToolbarButtonProps) {
    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClick}
            title={title}
        >
            {children}
        </Button>
    );
}