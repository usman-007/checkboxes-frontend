"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; // Make sure axios is installed
import { API_URL, GRAFANA_DASHBOARD_URL, WEBSOCKET_URL } from "@/app/constants";

// Define the expected structure of the API response
type States = {
  [key: string]: boolean;
};

interface CheckboxGridProps {
  gridSize?: number; // Make gridSize optional or required as needed
}

const CheckboxGrid: React.FC<CheckboxGridProps> = ({ gridSize = 20 }) => {
  const [grid, setGrid] = useState<boolean[][]>(() =>
    Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(false))
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Ref to store references to the input elements for animation triggering
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);
  // WebSocket reference
  const socketRef = useRef<WebSocket | null>(null);

  // Initialize refs array - ensures it matches grid dimensions
  useEffect(() => {
    inputRefs.current = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null));
  }, [gridSize]);

  // --- WebSocket Connection Setup ---
  useEffect(() => {
    const websocketUrl = WEBSOCKET_URL;
    console.log("websocketUrl", websocketUrl);
    if (!websocketUrl) {
      throw new Error("NEXT_PUBLIC_WS_URL is not set");
    }
    // Connect to WebSocket
    const socket = new WebSocket(websocketUrl);
    socketRef.current = socket;

    // Connection opened
    socket.addEventListener("open", () => {
      console.log("Connected to WebSocket server");
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
      try {
        // Parse the message format: "(row,column):value"
        const messageRegex = /\((\d+),(\d+)\):(\w+)/;
        const match = event.data.match(messageRegex);

        if (match) {
          const row = parseInt(match[1], 10) - 1; // Convert to 0-based index
          const col = parseInt(match[2], 10) - 1; // Convert to 0-based index
          const value = match[3] === "true"; // Convert string to boolean

          console.log(`WebSocket update: (${row},${col}):${value}`);

          // Update grid with the new value
          setGrid((prevGrid) => {
            // Only update if within bounds
            if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
              const newGrid = [...prevGrid];
              newGrid[row] = [...prevGrid[row]];
              newGrid[row][col] = value;

              // Trigger animation if checkbox is being checked
              if (value === true) {
                const inputElement = inputRefs.current[row]?.[col];
                if (inputElement) {
                  inputElement.classList.add("animate-shake");
                  setTimeout(() => {
                    inputElement?.classList.remove("animate-shake");
                  }, 500);
                }
              }

              return newGrid;
            }
            return prevGrid;
          });
        } else {
          console.warn("Received malformed WebSocket message:", event.data);
        }
      } catch (e) {
        console.error("Error processing WebSocket message:", e);
      }
    });

    // Connection closed
    socket.addEventListener("close", () => {
      console.log("Disconnected from WebSocket server");
    });

    // Connection error
    socket.addEventListener("error", (error) => {
      console.error("WebSocket error occurred:", error);
    });

    // Clean up on unmount
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [gridSize]);

  // --- Fetch initial state from the backend ---
  useEffect(() => {
    const fetchInitialState = async () => {
      setIsLoading(true);
      setError(null);
      const url = `${API_URL}/checkbox`;

      if (!API_URL) {
        console.error(
          "Error: NEXT_PUBLIC_API_URL environment variable is not set."
        );
        setError("API URL is not configured.");
        setIsLoading(false);
        return;
      }

      try {
        console.log(`Fetching initial state from: ${url}`);
        const response = await axios.get<States>(url);
        const apiStates = response.data;

        const newGrid = Array(gridSize)
          .fill(null)
          .map(() => Array(gridSize).fill(false));
        const keyRegex = /states:\((\d+),(\d+)\)/;

        for (const key in apiStates) {
          const match = key.match(keyRegex);
          if (match) {
            const rowFromApi = parseInt(match[1], 10);
            const colFromApi = parseInt(match[2], 10);
            const rowIndex = rowFromApi - 1;
            const colIndex = colFromApi - 1;

            if (
              rowIndex >= 0 &&
              rowIndex < gridSize &&
              colIndex >= 0 &&
              colIndex < gridSize
            ) {
              newGrid[rowIndex][colIndex] = apiStates[key];
            } else {
              console.warn(
                `API returned out-of-bounds key: ${key} for gridSize ${gridSize}`
              );
            }
          } else {
            console.warn(`API returned malformed key: ${key}`);
          }
        }
        setGrid(newGrid);
      } catch (err) {
        console.error("Failed to fetch initial checkbox state:", err);
        setError(
          "Failed to load grid state. Please check connection or try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialState();
  }, [gridSize]); // Rerun if gridSize changes

  // --- Helper functions for dynamic sizing (more granular) ---
  const getCheckboxSizeClasses = () => {
    // Base size
    let sizeClass = "w-4 h-4"; // Default small size
    if (gridSize <= 5) sizeClass = "w-10 h-10";
    else if (gridSize <= 10) sizeClass = "w-8 h-8";
    else if (gridSize <= 15) sizeClass = "w-6 h-6";
    else if (gridSize <= 25) sizeClass = "w-5 h-5";

    return sizeClass;
  };

  const getGapClass = () => {
    if (gridSize <= 5) return "gap-3 md:gap-4";
    if (gridSize <= 10) return "gap-2 md:gap-3";
    if (gridSize <= 20) return "gap-1.5 md:gap-2";
    if (gridSize <= 30) return "gap-1 md:gap-1.5";
    return "gap-0.5 md:gap-1"; // For very large grids
  };

  // --- Handle Checkbox Change (Adds Shake Animation) ---
  const handleCheckboxChange = (row: number, col: number): void => {
    const currentValue = grid[row][col];
    const nextValue = !currentValue;

    // --- Optimistic UI Update ---
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      newGrid[row] = [...prevGrid[row]];
      newGrid[row][col] = nextValue;
      return newGrid;
    });

    // --- Trigger Shake Animation if checking the box ---
    if (nextValue === true) {
      const inputElement = inputRefs.current[row]?.[col]; // Use optional chaining
      if (inputElement) {
        inputElement.classList.add("animate-shake");
        // Remove the class after the animation duration (500ms)
        setTimeout(() => {
          inputElement?.classList.remove("animate-shake"); // Use optional chaining again
        }, 500); // Match animation duration
      }
    }

    // --- Update Backend ---
    const updateBackendState = async () => {
      const url = `${API_URL}/checkbox`;
      if (!API_URL) {
        console.error("API URL not set for PATCH request.");
        // Optionally revert UI or show specific error
        return;
      }
      // Assuming backend expects 1-based index for PATCH
      const queryParams = `?row=${row + 1}&column=${
        col + 1
      }&value=${nextValue}`;
      try {
        const request = await axios.patch(url + queryParams);
        console.log("Backend update successful:", request.data);
      } catch (error) {
        console.error("Failed to update backend state:", error);
      }
    };

    updateBackendState();
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-400">
        Loading grid state...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-red-500 p-4">
        Error: {error}
      </div>
    );
  }

  const checkboxSizeClass = getCheckboxSizeClasses();
  const gapClass = getGapClass();

  return (
    // --- Main container with dark background ---
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full flex flex-col items-center">
        <h1 className="text-3xl font-bold text-white text-center pt-2 mb-4 select-none drop-shadow-lg">
          400 Checkboxes!
        </h1>
        {/* --- The Grid --- */}
        <div
          className={`grid ${gapClass} place-items-center bg-gray-800/30 backdrop-blur-sm p-4 md:p-6 rounded-lg shadow-xl border border-gray-700/50`}
          // Use inline style for precise column count, especially for larger grids
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {grid.map((rowArr, rowIndex) =>
            rowArr.map((isChecked, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="relative flex items-center justify-center"
              >
                {/* --- Custom Styled Checkbox --- */}
                <input
                  ref={(el) => {
                    // Assign ref to the input element
                    if (inputRefs.current[rowIndex]) {
                      inputRefs.current[rowIndex][colIndex] = el;
                    }
                  }}
                  id={`checkbox-${rowIndex}-${colIndex}`} // Unique ID for label association (optional but good practice)
                  type="checkbox"
                  // --- Styling Classes ---
                  className={`
                  peer 
                  appearance-none 
                  ${checkboxSizeClass} 
                  border-2 border-gray-600
                  rounded
                  bg-gray-700/50 
                  cursor-pointer
                  transition-colors duration-200 ease-in-out
                  // --- Checked State Styles (using peer-checked) ---
                  checked:bg-teal-500 // Background color when checked
                  checked:border-teal-400 // Border color when checked
                  // --- Focus Styles ---
                  focus:outline-none
                  focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500
                  // --- Hover Styles ---
                  hover:border-gray-500
                  checked:hover:bg-teal-600
                `}
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(rowIndex, colIndex)}
                />
                {/* --- Custom Checkmark (appears when checked using peer-checked) --- */}
                <svg
                  className={`
                  absolute
                  ${checkboxSizeClass} // Match size
                  p-0.5 // Padding for the checkmark
                  text-white // Checkmark color
                  pointer-events-none // Click through the SVG
                  opacity-0 // Hidden by default
                  transition-opacity duration-200 ease-in-out
                  // --- Show when peer (the input) is checked ---
                  peer-checked:opacity-100
                `}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            ))
          )}
        </div>
        <a
          href={GRAFANA_DASHBOARD_URL}
          target="_blank"
          rel="noopener noreferrer"
          // className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 transition text-lg text-center"
        >
          <button className="p-[3px] relative mt-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-800 rounded-lg" />
            <div className="px-8 py-2  bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
              Grafana Monitoring Dashboard
            </div>
          </button>
        </a>
        {/* --- Add the CSS for shake animation here if not global --- */}
        <style jsx global>{`
          @keyframes shake {
            0%,
            100% {
              transform: translateX(0);
            }
            10%,
            30%,
            50%,
            70%,
            90% {
              transform: translateX(-3px);
            }
            20%,
            40%,
            60%,
            80% {
              transform: translateX(3px);
            }
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default CheckboxGrid;
