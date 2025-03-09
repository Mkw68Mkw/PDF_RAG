"use client"; // Falls du den Next.js App Router nutzt

import React, { useState, useEffect, useRef } from "react";
import config from "../../config"; // Importiere die Konfiguration

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null); // Referenz für das Ende der Nachrichten

  useEffect(() => {
    const fetchHistory = async () => {
      const response = await fetch(`${config.apiUrl}/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Stellt sicher, dass Cookies mitgeschickt werden
      });
      console.log("Current environment:", process.env.NODE_ENV);

      const data = await response.json();
      if (data.history) {
        setMessages(data.history); // Lade die Konversationshistorie
      }
      // Optional: conversationId setzen, wenn das Backend sie zurückgibt
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
    };

    fetchHistory();
  }, []); // Leeres Array sorgt dafür, dass der Effekt nur beim ersten Laden ausgeführt wird.

  useEffect(() => {
    // Scrollt zum Ende der Nachrichten, wenn sich die Nachrichten ändern
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); // Abhängigkeit von messages

  const sendMessage = async (text) => {
    const newMessage = { id: messages.length, text, sender: "User" };
    setMessages([...messages, newMessage]);

    try {
      const res = await fetch(`${config.apiUrl}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
        credentials: "include", // Stellt sicher, dass Cookies mitgeschickt werden
      });

      const data = await res.json();
      const botMessage = { id: messages.length + 1, text: data.response, sender: "Bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Fehler beim Abrufen der Antwort:", error);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 border rounded-lg shadow-lg">
      <div className="h-80 overflow-y-auto p-2 border-b">
        {messages.map((msg, i) => (
          <div key={i} className={`p-2 my-1 ${msg.sender === "User" ? "text-right" : "text-left"}`}>
            <span className={`inline-block px-3 py-1 rounded-lg ${msg.sender === "User" ? "bg-blue-500 text-white" : "bg-gray-300"}`}>
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Referenz für das Ende der Nachrichten */}
      </div>
      <input
        type="text"
        className="w-full p-2 mt-2 border rounded"
        placeholder="Schreibe eine Nachricht..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage(e.target.value);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
};

export default Chat;
