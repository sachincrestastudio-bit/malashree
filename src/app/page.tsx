import { getKitchenMenu } from "@/actions/menu";
import { getHomepageContent } from "@/actions/adminHomepage";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [initialDishes, initialHomepageContent] = await Promise.all([
    getKitchenMenu(),
    getHomepageContent(),
  ]);

  return (
    <HomeClient
      initialDishes={initialDishes || []}
      initialHomepageContent={initialHomepageContent || null}
    />
  );
}
