// app/signup/page.tsx (or wherever your signup page lives)
import SignUpForm from "@/components/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUpForm />
    </div>
  );
}
