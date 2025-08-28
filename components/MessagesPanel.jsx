"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ConversationList from "./ConversationList";
import MessageThread from "./MessageThread";

export default function MessagesPanel({ currentUserId }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1_id.eq.${currentUserId},participant_2_id.eq.${currentUserId}`)
        .order("updated_at", { ascending: false });

      if (!error) setConversations(data);
      else console.error("Error fetching conversations:", error);
    };

    if (currentUserId) fetchConversations();
  }, [currentUserId]);

  return (
    <div className="flex border rounded-lg shadow bg-white h-[70vh]">
      {/* Left: List of conversations */}
      <div className="w-1/3 border-r overflow-y-auto">
        <ConversationList
          conversations={conversations}
          currentUserId={currentUserId}
          onSelect={setSelectedConversation}
          selectedId={selectedConversation?.id}
        />
      </div>

      {/* Right: Chat view */}
      <div className="flex-1 overflow-y-auto">
        {selectedConversation ? (
          <MessageThread
            conversation={selectedConversation}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="p-6 text-gray-500">Select a conversation to view messages.</div>
        )}
      </div>
    </div>
  );
}
