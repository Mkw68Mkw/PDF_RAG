"use client"; // Falls du den Next.js App Router nutzt

import React, { useState, useEffect, useRef } from "react";
import config from "../../config"; // Importiere die Konfiguration
import { FaUser, FaRobot, FaRegCommentDots } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null); // Referenz für das Ende der Nachrichten
  const chatContainerRef = useRef(null); // Referenz für den Hauptcontainer

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
    if (chatContainerRef.current && messagesEndRef.current) {
      // Scrollt nur innerhalb des Chat-Containers
      chatContainerRef.current.scrollTo({
        top: messagesEndRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const sendMessage = async (text) => {
    const newMessage = { id: messages.length, text, sender: "user" };
    setMessages([...messages, newMessage]);
    setIsLoading(true);

    try {
      const res = await fetch(`${config.apiUrl}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
        credentials: "include", // Stellt sicher, dass Cookies mitgeschickt werden
      });

      const data = await res.json();
      const botMessage = { 
        id: messages.length + 1, 
        text: data.response, 
        sender: "bot",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Fehler beim Abrufen der Antwort:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Message Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-red-200 scrollbar-track-red-50"
        style={{ height: 'calc(100vh - 200px)' }} // Adjust height as needed
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} gap-3`}>
            {msg.sender === "bot" && (
              <div className="flex items-start pt-1">
                <FaRobot className="text-xl text-red-500" />
              </div>
            )}
            
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.sender === "user" 
                ? "bg-red-500 text-white ml-auto" 
                : "bg-white shadow-md"
            }`}>
              <p className="text-sm">{msg.text}</p>
              <div className="mt-1 text-xs opacity-70">{msg.timestamp}</div>
            </div>

            {msg.sender === "user" && (
              <div className="flex items-start pt-1">
                <FaUser className="text-xl text-gray-500" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-red-500 pl-2">
            <FaRegCommentDots className="animate-pulse" />
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Area */}
      <div className="sticky bottom-0 bg-white border-t p-4 shadow-lg">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            className="w-full p-3 pr-16 border-2 border-red-100 rounded-full focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-200"
            placeholder="Nachricht schreiben..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                sendMessage(e.target.value);
                e.target.value = "";
              }
            }}
          />
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 p-2 rounded-full hover:bg-red-600 transition-colors"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling;
              if (input.value.trim()) {
                sendMessage(input.value);
                input.value = "";
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
