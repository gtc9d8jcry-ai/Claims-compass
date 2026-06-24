import { createRootRoute, Outlet } from '@tanstack/react-router';
import { AppSidebar } from '../components/app-sidebar';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar (hidden on mobile for now) */}
        <AppSidebar />
        
        {/* Main content area */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}