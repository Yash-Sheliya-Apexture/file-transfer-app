// client/src/app/(website)/layout.tsx
import WebsiteHeader from "@/components/layout/WebsiteHeader";
import WebsiteFooter from "@/components/layout/WebsiteFooter";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <WebsiteHeader />
      <main className="flex-1">{children}</main>
      <WebsiteFooter />
    </div>
  );
}