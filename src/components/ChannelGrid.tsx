import { Card, CardContent } from "@/components/ui/card";
import { Tv } from "lucide-react";
import type { Channel } from "../data/channels";

interface ChannelGridProps {
  category: string;
  channels: Channel[];
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
}

export const ChannelGrid = ({ category, channels, selectedChannel, onChannelSelect }: ChannelGridProps) => {
  const categoryChannels = channels
    .filter((channel) => channel.category === category)
    .slice(0, 10);

  if (categoryChannels.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-white text-2xl font-bold mb-4">{category}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categoryChannels.map((channel, index) => (
          <Card
            key={channel.id || `${category}-${index}`}
            className={`cursor-pointer transition-transform hover:scale-105 ${
              selectedChannel?.name === channel.name ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onChannelSelect(channel)}
          >
            <CardContent className="p-4 flex flex-col items-center justify-center">
              {channel.logo ? (
                <img
                  src={channel.logo}
                  alt={channel.name}
                  className="w-16 h-16 object-contain mb-2"
                />
              ) : (
                <Tv className="w-16 h-16 mb-2" />
              )}
              <p className="text-center font-medium">{channel.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};