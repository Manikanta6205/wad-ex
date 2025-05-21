import React, { useState, useEffect } from "react";
import BookmarkForm from "./components/BookmarkForm";
import BookmarkTable from "./components/BookmarkTable";
import ExportButton from "./components/ExportButton";
import "./styles.css";

const App = () => {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/bookmarks")
      .then((response) => response.json())
      .then((data) => setBookmarks(data))
      .catch((error) => console.error("Error fetching bookmarks:", error));
  }, []);

  const addBookmark = (bookmark) => {
    fetch("http://localhost:5000/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookmark),
    })
      .then((response) => response.json())
      .then((newBookmark) => setBookmarks([...bookmarks, newBookmark]))
      .catch((error) => console.error("Error adding bookmark:", error));
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Bookmark Manager</h1>
      </header>
      <main>
        <BookmarkForm addBookmark={addBookmark} />
        <BookmarkTable bookmarks={bookmarks} />
      </main>
    </div>
  );
};

export default App;