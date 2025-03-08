import Image from "next/image";
import CheckboxGrid from "../../components/CheckboxGrid";
export default function Home() {
  return (
    <div className="min-h-screen bg-white py-12">
      <h1 className="text-3xl font-bold tracking-wider mb-8 text-gray-800 text-center">
        CHECKBOXES
      </h1>
      <CheckboxGrid gridSize={20} />
    </div>
  );
}
