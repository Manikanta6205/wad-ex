import React, { useState } from "react";

const BookmarkForm = ({ addBookmark }) => {
  const [url, setUrl] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    addBookmark({ url, date, notes, tags });
    setUrl("");
    setDate("");
    setNotes("");
    setTags("");
  };

  return (
    <form onSubmit={handleSubmit} className="bookmark-form card">
        <h1>Add Bookmark</h1>
      <input
        type="url"
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <input
        type="text"
        placeholder="Tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <button type="submit">Add Bookmark</button>
    </form>
  );
};

export default BookmarkForm;