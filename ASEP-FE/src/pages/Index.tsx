import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-6">
            <GraduationCap className="h-16 w-16 text-primary" />
          </div>
        </div>
        <h1 className="text-5xl font-bold tracking-tight">Mentor Platform</h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Professional mentoring and learning management system
        </p>
        <Button onClick={() => navigate("/admin")} size="lg" className="mt-4">
          Access Admin Panel
        </Button>
      </div>
    </div>
  );
};

export default Index;
