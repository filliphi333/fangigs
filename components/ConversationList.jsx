import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ConversationList({ conversations, currentUserId, onSelect, selectedId }) {
  const [participants, setParticipants] = useState({});

  useEffect(() => {
    const fetchParticipants = async () => {
      const ids = conversations
        .map((conv) => (conv.participant_1_id === currentUserId ? conv.participant_2_id : conv.participant_1_id))
        .filter((id, index, self) => self.indexOf(id) === index); // Unique

      if (ids.length === 0) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, headshot_image")
        .in("id", ids);

      if (!error) {
        const map = {};
        data.forEach((p) => {
          map[p.id] = p;
        });
        setParticipants(map);
      } else {
        console.error("Error fetching participants:", error);
      }
    };

    fetchParticipants();
  }, [conversations, currentUserId]);

  return (
    <div className="divide-y">
      {conversations.map((conv) => {
        const partnerId = conv.participant_1_id === currentUserId ? conv.participant_2_id : conv.participant_1_id;
        const partner = participants[partnerId];

        return (
          <div
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`cursor-pointer p-4 hover:bg-gray-100 ${
              selectedId === conv.id ? "bg-blue-100" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  partner?.headshot_image
                    ? `https://xeqkvaqpgqyjlybexxmm.supabase.co/storage/v1/object/public/avatars/${partner.headshot_image}`
                    : "/placeholder-avatar.png"
                }
                alt={partner?.full_name || "User"}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{partner?.full_name || "Unknown"}</p>
                <p className="text-xs text-gray-500">{new Date(conv.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
