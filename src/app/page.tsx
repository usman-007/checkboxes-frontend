"use client";
import CheckboxGrid from "../../components/CheckboxGrid";
import { VERSION } from "./constants";
import InfoBox from "../../components/infoBox";
import { useState, useRef } from "react";

export default function Home() {
  const [infoOpen, setInfoOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const openInfo = () => {
    setShowInfo(true);
    setTimeout(() => setInfoOpen(true), 10);
  };

  const closeInfo = () => {
    setInfoOpen(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowInfo(false), 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <CheckboxGrid gridSize={20} />
      <div className="fixed bottom-4 right-4 bg-gray-100 text-gray-500 px-3 py-1 rounded-full shadow text-xs font-mono opacity-80 select-none pointer-events-none">
        {VERSION}
      </div>
      {/* Info Icon */}
      <button
        className="fixed top-4 right-4 z-50 bg-gray-800 bg-opacity-70 text-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-opacity-90 transition"
        aria-label="Show info"
        onClick={openInfo}
      >
        <span className="text-lg font-bold">i</span>
      </button>
      {/* InfoBox Modal with Fade Transition */}
      {showInfo && (
        <div
          className={`fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-10 transition-opacity duration-200 ${
            infoOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeInfo}
        >
          <div className="relative z-50" onClick={(e) => e.stopPropagation()}>
            <InfoBox version={VERSION} />
          </div>
        </div>
      )}
    </div>
  );
}
