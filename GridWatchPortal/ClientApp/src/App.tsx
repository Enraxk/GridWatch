import {useState, useEffect, useMemo} from "react";
import {BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom";
import {SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/AppSidebar";
import {ThemeProvider} from "@/components/theme-provider";
import {Navbar} from "@/components/Navbar";
import {Dashboard} from "@/pages/Dashboard.tsx";
import {GridTesting} from "@/pages/GridTesting.tsx";
import {DynamicDashboard} from "./pages/DyndamicDashboard.tsx";
import 'azure-maps-control/dist/atlas.min.css'
import NotificationsPage from "./pages/NotificationsPage.tsx";
import TestPage from "./pages/TestPage.tsx";
import ContactSelectorTestPage from "./pages/ContactSelectorTestPage.tsx";
import BatchDevicePage from "./pages/BatchDevicePage.tsx";
import ManageDevicePage from "./pages/ManageDevicePage.tsx";
import DeviceGraphingPage from "./pages/DeviceGraphingPage.tsx";


const SIDEBAR_POSITION_KEY = "sidebar_position";

export default function App() {
    const [side, setSide] = useState<"left" | "right">(() =>
        (localStorage.getItem(SIDEBAR_POSITION_KEY) as "left" | "right") || "right"
    );

    const [isResizable, setIsResizable] = useState(false);
    
    // Memoize the sidebar change handler
    const handleSideChange = useMemo(() => {
        const handler: React.Dispatch<React.SetStateAction<"left" | "right">> = (newSide) => {
            if (typeof newSide === 'function') {
                const updatedSide = newSide(side);
                setSide(updatedSide);
                localStorage.setItem(SIDEBAR_POSITION_KEY, updatedSide);
            } else {
                setSide(newSide);
                localStorage.setItem(SIDEBAR_POSITION_KEY, newSide);
            }
        };
        return handler;
    }, [side]);

    // Prevent unnecessary re-renders by memoizing routes
    const routes = useMemo(() => (
        <Routes>
            <Route path="/" element={<Dashboard/>}/>
            <Route path="/test" element={<TestPage />} />
            <Route path="/test-contact-selector" element={<ContactSelectorTestPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/dashboard" element={<Navigate to="/" replace/>}/>
            <Route path="/grid-testing" element={<GridTesting/>}/>
            <Route path="/devices/batch" element={<BatchDevicePage />} />
            <Route path="/devices/manage" element={<ManageDevicePage />} />
             <Route path="/device-graphing" element={<DeviceGraphingPage />} />
            <Route path="/dynamic-dashboard" element={<DynamicDashboard isResizable={isResizable}/>}/>
        </Routes>
    ), [isResizable]);

    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <SidebarProvider>
                <Router>
                    <div className="flex flex-col min-h-screen">
                        <div className="flex flex-1">
                            {side === "left" && (
                                <AppSidebar
                                    side={side}
                                    onSideChange={handleSideChange}
                                    isResizable={isResizable}
                                    setIsResizable={setIsResizable}
                                />
                            )}
                            <main className="flex-1 p-4">
                                <Navbar/>
                                <div className="h-px bg-gray-300 dark:bg-gray-700 my-2"></div>
                                {routes}
                            </main>
                            {side === "right" && (
                                <AppSidebar
                                    side={side}
                                    onSideChange={handleSideChange}
                                    isResizable={isResizable}
                                    setIsResizable={setIsResizable}
                                />
                            )}
                        </div>
                    </div>
                </Router>
            </SidebarProvider>
        </ThemeProvider>
    );
}