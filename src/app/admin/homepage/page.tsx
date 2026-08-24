import { getHomepageContent } from "@/actions/adminHomepage";
import AdminHomepageClient from "./AdminHomepageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Homepage Content Management | Malashree Admin",
};

export default async function AdminHomepagePage() {
  const initialContent = await getHomepageContent();

  return (
    <div className="flex-1 p-6 md:p-8 bg-cream/30 min-h-screen overflow-y-auto">
      <AdminHomepageClient initialContent={initialContent} />
    </div>
  );
}
