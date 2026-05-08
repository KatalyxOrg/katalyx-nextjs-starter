import { StatusMessage } from "@/components/ui/empty-state";

export default function RootLoading() {
  return (
    <div className="m-6">
      <StatusMessage type="info" message="Chargement en cours..." />
    </div>
  );
}
