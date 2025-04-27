import Image from "next/image";
import CheckboxGrid from "../../components/CheckboxGrid";
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <CheckboxGrid gridSize={20} />
    </div>
  );
}
