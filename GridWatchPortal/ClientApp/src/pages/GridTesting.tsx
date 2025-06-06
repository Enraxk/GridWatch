import { useEffect, useState } from 'react'
import GridLayout from 'react-grid-layout'
import { GridCard, GridCardHeader, GridCardTitle, GridCardContent, GridCardFooter } from "@/components/ui/grid-card"
import { useSidebar } from "@/components/ui/sidebar"
import pinIcon from "@/assets/pin-svgrepo-com.svg"
import moveIcon from "@/assets/drag-horizontal-svgrepo-com.svg" 

const LAYOUT_STORAGE_KEY = "grid_testing_layout"

export const GridTesting = () => {
    const { state: sidebarState } = useSidebar()
    const [layout, setLayout] = useState(() => {
        const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY)
        return savedLayout ? JSON.parse(savedLayout) : []
    })
    const [isResizable] = useState(true)
    const [isDraggable] = useState(true)

    useEffect(() => {
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout))
    }, [layout])

    const gridWidth = sidebarState === "expanded" ? 1310 : 1450

    const addCard = () => {
        const newCard = {
            i: `card${layout.length + 1}`,
            x: layout.length % 6,
            y: Math.floor(layout.length / 6),
            w: Math.max(Math.floor(Math.random() * 2) + 1),
            h: Math.max(Math.floor(Math.random() * 2) + 1, 6),
            minW: 1,
            minH: 6,
            isResizable: true,
            isDraggable: true
        }
        setLayout([...layout, newCard])
    }

    const addPromtedCard = () => {
        const numCards = parseInt(prompt("Enter the number of cards to add:") as string, 10)
        if (!isNaN(numCards) && numCards > 0) {
            const newCards = Array.from({ length: numCards }, (_, index) => ({
                i: `card${layout.length + index + 1}`,
                x: (layout.length + index) % 6,
                y: Math.floor((layout.length + index) / 6),
                w: Math.max(Math.floor(Math.random() * 2) + 1),
                h: Math.max(Math.floor(Math.random() * 2) + 1, 6),
                minW: 1,
                minH: 6,
                isResizable: true,
                isDraggable: true
            }))
            setLayout([...layout, ...newCards])
        }
    }

    const removeCard = () => {
        if (layout.length > 0) {
            setLayout(layout.slice(0, -1))
        }
    }

    const removeAllcards = () => {
        setLayout([])
    }

    const toggleCardResizable = (cardId: any) => {
        setLayout(layout.map((card: { i: any; isResizable: any }) =>
            card.i === cardId ? { ...card, isResizable: !card.isResizable } : card
        ))
    }

    const toggleCardDraggable = (cardId: any) => {
        setLayout(layout.map((card: { i: any; isDraggable: any }) =>
            card.i === cardId ? { ...card, isDraggable: !card.isDraggable } : card
        ))
    }

    return (
        <div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 mt-1" onClick={addCard}>Add Card</button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 mt-1" onClick={addPromtedCard}>Add Promted Card</button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2 mt-1" onClick={removeCard}>Remove one Card</button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2 mt-1" onClick={removeAllcards}>Remove All Cards</button>

            <h1 className="text-2xl font-bold mb-4">Grid Testing</h1>
            <GridLayout
                className="layout"
                layout={layout}
                cols={6}
                rowHeight={30}
                width={gridWidth}
                isResizable={isResizable}
                isDraggable={isDraggable}
                resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
                draggableHandle=".move-icon"
                onLayoutChange={(newLayout) => setLayout(newLayout)}
            >
                {layout.map(card => (
                    <GridCard key={card.i} cardId={''} layout={[]} setLayout={function (layout: any[]): void {
                        throw new Error('Function not implemented.')
                    } }>
                        <GridCardHeader className="grid-card-header">
                            <GridCardTitle>{card.i}</GridCardTitle>
                            <button
                                onClick={() => toggleCardDraggable(card.i)}
                                style={{ cursor: 'pointer', position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', padding: 0 }}
                            >
                                <img
                                    src={pinIcon}
                                    alt="Pin"
                                    className="pin-icon"
                                />
                            </button>
                        </GridCardHeader>
                        <GridCardContent>
                            <p>Content for {card.i}</p>
                            <p>Size: W: {card.w} x H: {card.h}</p>
                            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 mt-1" onClick={() => toggleCardResizable(card.i)}>
                                {card.isResizable ? "Disable Resizing" : "Enable Resizing"}
                            </button>
                           
                        </GridCardContent>
                      <GridCardFooter>
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', cursor: 'move' }} className="move-icon">
                              <img src={moveIcon} alt="Mover" />
                          </div>
                      </GridCardFooter>
                    </GridCard>
                ))}
            </GridLayout>
        </div>
    )
}