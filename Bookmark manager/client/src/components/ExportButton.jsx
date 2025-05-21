import React from "react";

const ExportButton = ({ bookmarks }) => {
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(bookmarks, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bookmarks.json";
    link.click();
  };

  return (
    <div className="export-btn">
      <button onClick={handleExportJSON}>Export as JSON</button>
    </div>
  );
};

export default ExportButton;