import React, { useState, type KeyboardEvent } from "react";
import "./UsernameModal.css";
import { useAppDispatch } from "../hooks";
import { setUsername } from "../store/chatSlice";

interface Props {
  onSubmit: () => void;
}

const UsernameModal: React.FC<Props> = ({ onSubmit }) => {
  const dispatch = useAppDispatch();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setError("Please enter at least 2 characters.");
      return;
    }
    dispatch(setUsername(trimmed));
    onSubmit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-icon">💬</div>
        <h1 className="modal-title">Welcome to Chat App</h1>
        <p className="modal-subtitle">Enter a username to join the conversation</p>
        <input
          className={`modal-input ${error ? "modal-input--error" : ""}`}
          type="text"
          placeholder="e.g. alice123"
          value={value}
          maxLength={20}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        {error && <p className="modal-error">{error}</p>}
        <button className="modal-button" onClick={handleSubmit}>
          Enter Chat →
        </button>
      </div>
    </div>
  );
};

export default UsernameModal;
