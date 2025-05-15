
import Dashboard from "@/components/Dashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b py-4">
        <div className="container mx-auto px-4">
          <h1 className="font-bold text-xl text-primary">Financial Analytics Dashboard</h1>
        </div>
      </header>
      <main className="animate-fade-in">
        <Dashboard />
      </main>
    </div>
  );
};

export default Index;
