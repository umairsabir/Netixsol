import { ShellLayout } from "@/components/layout/ShellLayout";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <ShellLayout>{children}</ShellLayout>;
}
