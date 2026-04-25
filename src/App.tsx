import { useSession } from "@/hooks/useSession";
import { Login } from "@/components/Login";
import { Dashboard } from "@/components/Dashboard";

export default function App() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        載入中…
      </div>
    );
  }

  return session ? <Dashboard session={session} /> : <Login />;
}
