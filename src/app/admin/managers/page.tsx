import { connectToDatabase } from "@/database/mongoose";
import { Kitchen } from "@/models/Kitchen";
import { getBranchManagers } from "@/actions/adminManagers";
import BranchManagersClient from "./BranchManagersClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Branch Heads & Kitchen Managers | Malashree Admin",
};

export default async function BranchManagersPage() {
  await connectToDatabase();

  const [managers, rawKitchens] = await Promise.all([
    getBranchManagers(),
    Kitchen.find({ status: "active", deletedAt: null }).sort({ name: 1 }).lean(),
  ]);

  const branches = rawKitchens.map((k: any) => ({
    id: k._id.toString(),
    name: k.name,
    code: k.code,
    area: k.area || k.address || "Pune",
  }));

  return <BranchManagersClient initialManagers={managers} branches={branches} />;
}
