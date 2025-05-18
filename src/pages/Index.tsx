
import Dashboard from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b py-3 sm:py-4 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="font-bold text-lg sm:text-xl text-primary">VietMap Transaction Analytics Dashboard</h1>
          <Link to="/trial-monitor">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              Trial Monitor
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>
      <main className="animate-fade-in pb-8">
        <Dashboard />
      </main>
    </div>
  );
};

export default Index;
