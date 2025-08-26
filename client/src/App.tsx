import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <h1 className="text-4xl font-bold text-center mb-8">
            Fresh Start - Berry Events
          </h1>
          <p className="text-center text-gray-600">
            Clean slate - ready to build something amazing!
          </p>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;