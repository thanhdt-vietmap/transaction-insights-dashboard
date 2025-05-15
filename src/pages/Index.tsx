
import Dashboard from "@/components/Dashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b py-3 sm:py-4 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <h1 className="font-bold text-lg sm:text-xl text-primary">Financial Analytics Dashboard</h1>
        </div>
      </header>
      <main className="animate-fade-in pb-8">
        <Dashboard />
      </main>
    </div>
  );
};

export default Index;
