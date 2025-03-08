"use client";
import axios from "axios";
import React, { useState } from "react";

interface CheckboxGridProps {
  gridSize?: number;
}

type ApiRequestType = {
  row: number;
  column: number;
  checked: boolean;
};

const CheckboxGrid: React.FC<CheckboxGridProps> = ({ gridSize = 5 }) => {
  // Initialize grid with all checkboxes unchecked
  const [grid, setGrid] = useState<boolean[][]>(
    Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(false))
  );

  // Calculate appropriate checkbox size based on grid size
  const getCheckboxSize = () => {
    if (gridSize <= 10) return "w-6 h-6 md:w-7 md:h-7";
    if (gridSize <= 20) return "w-5 h-5 md:w-6 md:h-6";
    if (gridSize <= 50) return "w-4 h-4 md:w-5 md:h-5";
    return "w-3 h-3 md:w-4 md:h-4"; // For very large grids (> 50)
  };

  // Calculate appropriate gap size based on grid size
  const getGapSize = () => {
    if (gridSize <= 10) return "gap-4";
    if (gridSize <= 20) return "gap-2";
    if (gridSize <= 50) return "gap-1";
    return "gap-0.5"; // For very large grids (> 50)
  };

  const handleCheckboxChange = (row: number, col: number): void => {
    // Use functional state update to avoid unnecessary deep copies
    setGrid((prevGrid) => {
      // Create a new array reference for the grid
      const newGrid = [...prevGrid];
      // Create a new array reference only for the row being modified
      newGrid[row] = [...prevGrid[row]];
      // Toggle the checkbox state
      newGrid[row][col] = !prevGrid[row][col];

      return newGrid;
    });

    // Move the console.log outside the state updater function
    // This will ensure it only runs once per click event
    setTimeout(() => {
      const url = "";
      const data: ApiRequestType = {
        row: row,
        column: col,
        checked: !grid[row][col],
      };

      try {
        const request = axios.patch(url, {
          row: row,
          column: col,
          checked: !grid[row][col], // Use the inverse of current value since state hasn't updated yet
        });
      } catch (error) {
        console.error(error);
      }

      console.log({
        row: row,
        column: col,
        checked: !grid[row][col], // Use the inverse of current value since state hasn't updated yet
      });
    }, 0);
  };

  return (
    <div className="flex flex-col items-center p-8 max-w-6xl mx-auto bg-gray-900 text-white rounded-lg overflow-auto">
      <div
        className={`grid ${getGapSize()} w-full`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((isChecked, colIndex) => (
            <div
              className="relative flex items-center justify-center"
              key={`${rowIndex}-${colIndex}`}
            >
              <input
                type="checkbox"
                id={`checkbox-${rowIndex}-${colIndex}`}
                checked={isChecked}
                onChange={() => handleCheckboxChange(rowIndex, colIndex)}
                className="absolute opacity-0 w-0 h-0 cursor-pointer"
              />
              <label
                htmlFor={`checkbox-${rowIndex}-${colIndex}`}
                className={`
                  relative ${getCheckboxSize()} 
                  border border-opacity-50
                  cursor-pointer
                  transition-all duration-200 ease-in-out
                  ${
                    isChecked
                      ? "bg-blue-500 border-blue-500"
                      : "bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500"
                  }
                `}
              >
                {isChecked && (
                  <svg
                    className="absolute inset-0 w-full h-full text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CheckboxGrid;
