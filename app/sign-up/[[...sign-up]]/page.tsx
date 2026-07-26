import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4">
      <SignUp />
    </main>
  );
}
