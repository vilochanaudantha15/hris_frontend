// XLSPreviewer.jsx
// React component to upload an Excel (.xls or .xlsx) file, parse its first sheet, and
// display the contents in a responsive Tailwind‑styled table.
//
// Usage:
//   1. Install the SheetJS library in your project:
//        npm install xlsx
//   2. Drop this component anywhere in your React tree.
//
// Notes:
//   • This component reads only the first worksheet.
//   • Large spreadsheets may affect performance; consider pagination for big data sets.
//   • Binary .xls (BIFF) files are supported by SheetJS through the same API.

import React, { useState } from "react";
import * as XLSX from "xlsx";

const XLSPreviewer = () => {
  const [columns, setColumns] = useState([]); // Array<string>
  const [rows, setRows] = useState([]);      // Array<Array<any>>
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setError("");

    // Ensure it is an Excel file
    if (!/\.xls[x]?$/.test(file.name)) {
      setError("Please select a .xls or .xlsx file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Get first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // 2‑D array

        if (jsonData.length === 0) {
          setError("The sheet appears to be empty.");
          setColumns([]);
          setRows([]);
          return;
        }

        const [header, ...body] = jsonData;
        setColumns(header);
        setRows(body);
      } catch (err) {
        setError("Failed to parse the Excel file. Is the file corrupted?");
        console.error(err);
      }
    };

    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="xls-file">
          Upload Excel file
        </label>
        <input
          id="xls-file"
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
        {fileName && (
          <p className="mt-2 text-xs text-gray-500">Selected: {fileName}</p>
        )}
        {error && (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        )}
      </div>

      {rows.length > 0 && (
        <div className="overflow-x-auto border rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    scope="col"
                    className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider"
                  >
                    {col || `Column ${idx + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-gray-50">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-6 py-4 whitespace-nowrap">
                      {row[cIdx] !== undefined ? row[cIdx].toString() : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default XLSPreviewer;
