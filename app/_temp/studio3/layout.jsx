import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import Header from "./components/header";

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="w-full divide-y">
        <Header />
        {children}
      </main>
    </SidebarProvider>
  );
}
