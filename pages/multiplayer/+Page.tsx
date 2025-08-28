import { MultiplayerLobby } from '../../components/multiplayer/MultiplayerLobby';

export default function Page() {
  const handleGameJoined = () => {
    // Navigate to multiplayer game
    window.location.href = '/multiplayer-game';
  };

  return <MultiplayerLobby onGameJoined={handleGameJoined} />;
}
