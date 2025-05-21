import React, { useState } from "react";
import ExportButton from "./ExportButton";

const BookmarkTable = ({ bookmarks }) => {
  const [searchTag, setSearchTag] = useState("");

  const filteredBookmarks = bookmarks.filter((bookmark) =>
    bookmark.tags.toLowerCase().includes(searchTag.toLowerCase())
  );

  return (
    <div className="card">
        <h1>Bookmarks list</h1>
      <input
        type="text"
        placeholder="Search by tags"
        value={searchTag}
        onChange={(e) => setSearchTag(e.target.value)}
        className="search-bar"
      />
      <table className="bookmark-table">
        <thead>
          <tr>
            <th>URL</th>
            <th>Date</th>
            <th>Notes</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookmarks.map((bookmark, index) => (
            <tr key={index}>
              <td>
                <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                  {bookmark.url}
                </a>
              </td>
              <td>{bookmark.date}</td>
              <td>{bookmark.notes}</td>
              <td>{bookmark.tags}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
        
      <ExportButton bookmarks={filteredBookmarks} />
    </div>
  );
};

export default BookmarkTable;