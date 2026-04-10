import { Spinner } from "./Spinner";

export default function Loader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner size="lg" />
    </div>
  );
}
