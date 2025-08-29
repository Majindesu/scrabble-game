import React, { useState, useEffect } from "react";
import { Loader2, Users, Play, Plus, RefreshCw } from "lucide-react";
import { useMultiplayerGame } from "../../lib/hooks/useMultiplayerGame";
import { cn } from "../../lib/utils";

interface MultiplayerLobbyProps {
	onGameJoined: () => void;
}

// Simple button component
function Button({
	children,
	onClick,
	disabled = false,
	variant = "primary",
	size = "md",
	className = "",
}: {
	children: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	variant?: "primary" | "secondary" | "outline";
	size?: "sm" | "md";
	className?: string;
}) {
	const baseClasses =
		"inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
	const sizeClasses = size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-2";
	const variantClasses = {
		primary:
			"bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600",
		secondary:
			"bg-gray-600 text-white hover:bg-gray-700 disabled:hover:bg-gray-600",
		outline:
			"border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:hover:bg-white",
	};

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={cn(
				baseClasses,
				sizeClasses,
				variantClasses[variant],
				className
			)}
		>
			{children}
		</button>
	);
}

// Simple card components
function Card({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"bg-white rounded-lg border border-gray-200 shadow-sm",
				className
			)}
		>
			{children}
		</div>
	);
}

function CardHeader({ children }: { children: React.ReactNode }) {
	return <div className="px-6 py-4 border-b border-gray-200">{children}</div>;
}

function CardTitle({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<h3 className={cn("text-lg font-semibold text-gray-900", className)}>
			{children}
		</h3>
	);
}

function CardDescription({ children }: { children: React.ReactNode }) {
	return <p className="text-sm text-gray-600 mt-1">{children}</p>;
}

function CardContent({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

// Simple badge component
function Badge({
	children,
	variant = "default",
	className = "",
}: {
	children: React.ReactNode;
	variant?: "default" | "outline";
	className?: string;
}) {
	const baseClasses =
		"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
	const variantClasses =
		variant === "outline" ? "border bg-white" : "bg-gray-100 text-gray-800";

	return (
		<span className={cn(baseClasses, variantClasses, className)}>
			{children}
		</span>
	);
}

export function MultiplayerLobby({ onGameJoined }: MultiplayerLobbyProps) {
	const [playerName, setPlayerName] = useState("");
	const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
	const [isCreatingGame, setIsCreatingGame] = useState(false);
	const [maxPlayers, setMaxPlayers] = useState(2);

	const {
		isConnected,
		availableRooms,
		createGame,
		joinGame,
		requestRoomList,
		error,
		loading,
		game,
	} = useMultiplayerGame();

	// Auto-refresh room list
	useEffect(() => {
		if (isConnected) {
			requestRoomList();
			const interval = setInterval(requestRoomList, 5000); // Refresh every 5 seconds
			return () => clearInterval(interval);
		}
	}, [isConnected, requestRoomList]);

	// Navigate to game when joined
	useEffect(() => {
		if (game) {
			onGameJoined();
		}
	}, [game, onGameJoined]);

	const handleCreateGame = () => {
		if (!playerName.trim()) {
			return;
		}

		createGame(playerName.trim(), maxPlayers);
		setIsCreatingGame(true);
	};

	const handleJoinGame = (gameId: string) => {
		if (!playerName.trim()) {
			return;
		}

		joinGame(gameId, playerName.trim());
		setSelectedGameId(gameId);
	};

	const connectionStatus = isConnected ? (
		<Badge variant="outline" className="text-green-600 border-green-200">
			Connected
		</Badge>
	) : (
		<Badge variant="outline" className="text-red-600 border-red-200">
			Disconnected
		</Badge>
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-800 mb-2">
						Multiplayer Scrabble Lobby
					</h1>
					<p className="text-gray-600 mb-4">
						Create or join a game to play with friends online
					</p>
					{connectionStatus}
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
						{error}
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Create Game Section */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Plus className="w-5 h-5" />
								Create New Game
							</CardTitle>
							<CardDescription>
								Start a new multiplayer Scrabble game
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label
									htmlFor="playerName"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Your Name
								</label>
								<input
									id="playerName"
									type="text"
									placeholder="Enter your name"
									value={playerName}
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setPlayerName(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label
									htmlFor="maxPlayers"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Max Players
								</label>
								<select
									id="maxPlayers"
									value={maxPlayers}
									onChange={(
										e: React.ChangeEvent<HTMLSelectElement>
									) => setMaxPlayers(Number(e.target.value))}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value={2}>2 Players</option>
									<option value={3}>3 Players</option>
									<option value={4}>4 Players</option>
								</select>
							</div>

							<Button
								onClick={handleCreateGame}
								disabled={
									!playerName.trim() ||
									loading ||
									!isConnected ||
									isCreatingGame
								}
								className="w-full"
							>
								{loading && isCreatingGame ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Creating Game...
									</>
								) : (
									<>
										<Plus className="w-4 h-4 mr-2" />
										Create Game
									</>
								)}
							</Button>
						</CardContent>
					</Card>

					{/* Join Game Section */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 justify-between">
								<div className="flex items-center gap-2">
									<Users className="w-5 h-5" />
									Available Games
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={requestRoomList}
									disabled={!isConnected}
								>
									<RefreshCw className="w-4 h-4" />
								</Button>
							</CardTitle>
							<CardDescription>
								Join an existing game waiting for players
							</CardDescription>
						</CardHeader>
						<CardContent>
							{!playerName.trim() && (
								<div className="text-sm text-gray-500 mb-4 p-3 bg-gray-50 rounded">
									Enter your name above to join games
								</div>
							)}

							{availableRooms.length === 0 ? (
								<div className="text-center py-8 text-gray-500">
									<Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
									<p>No games available</p>
									<p className="text-sm">
										Create one to get started!
									</p>
								</div>
							) : (
								<div className="space-y-3">
									{availableRooms.map((room) => (
										<div
											key={room.id}
											className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
										>
											<div>
												<div className="font-medium text-gray-900">
													Game #{room.id.slice(-6)}
												</div>
												<div className="text-sm text-gray-500 flex items-center gap-2">
													<Users className="w-4 h-4" />
													{room.playerCount}/
													{room.maxPlayers} players
													<Badge
														variant="outline"
														className="text-xs"
													>
														{room.gameStatus}
													</Badge>
												</div>
											</div>

											<Button
												onClick={() =>
													handleJoinGame(room.id)
												}
												disabled={
													!playerName.trim() ||
													loading ||
													!isConnected ||
													(loading &&
														selectedGameId ===
															room.id)
												}
												size="sm"
											>
												{loading &&
												selectedGameId === room.id ? (
													<Loader2 className="w-4 h-4 animate-spin" />
												) : (
													<>
														<Play className="w-4 h-4 mr-1" />
														Join
													</>
												)}
											</Button>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Connection Help */}
				{!isConnected && (
					<Card className="mt-8 border-red-200 bg-red-50">
						<CardContent className="pt-6">
							<div className="text-center text-red-700">
								<h3 className="font-medium mb-2">
									Connection Issues?
								</h3>
								<p className="text-sm">
									Make sure the server is running and refresh
									the page. The multiplayer server should be
									accessible at localhost:3001.
								</p>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
