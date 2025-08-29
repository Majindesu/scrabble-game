import React from 'react';
import { PlayerStatsDashboard } from '../../components/stats/PlayerStatsDashboard';

interface PageProps {
  data: {
    playerId: string;
  };
}

export default function StatsPage({ data }: PageProps) {
  return <PlayerStatsDashboard playerId={data.playerId} />;
}
