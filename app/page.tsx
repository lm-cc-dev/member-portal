import { AuthSection } from "@/components/auth-section";

export default function Page() {
  return (
    <div>
      <div className="min-h-screen flex items-center justify-center p-4">
        <AuthSection />
      </div>
      <div>
        <p>Validating app update deployed!</p>
      </div>
    </div>
  );
}