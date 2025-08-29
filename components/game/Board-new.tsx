import React from "react";
import { BoardCell as BoardCellType } from "../../database/drizzle/schema/games";
import { BOARD_SIZE } from "../../lib/game/constants";
import { cn } from "../../lib/utils";

interface BoardProps {
	board: BoardCellType[][];
	onCellClick?: (row: number, col: number) => void;
	className?: string;
}

export function Board({ board, onCellClick, className }: BoardProps) {
	return (
		<div
			className={cn(
				"grid grid-cols-15 gap-0.5 bg-gray-800 p-2 rounded-lg",
				"w-full max-w-2xl mx-auto aspect-square",
				className
			)}
		>
			{board.map((row, rowIndex) =>
				row.map((cell, colIndex) => (
					<BoardCellComponent
						key={`${rowIndex}-${colIndex}`}
						cell={cell}
						row={rowIndex}
						col={colIndex}
						onClick={() => onCellClick?.(rowIndex, colIndex)}
					/>
				))
			)}
		</div>
	);
}

interface BoardCellProps {
	cell: BoardCellType;
	row: number;
	col: number;
	onClick?: () => void;
}

function BoardCellComponent({ cell, row, col, onClick }: BoardCellProps) {
	const getPremiumSquareClass = (premium?: string) => {
		switch (premium) {
			case "TW":
				return "bg-red-600 text-white";
			case "DW":
				return "bg-red-400 text-white";
			case "TL":
				return "bg-blue-600 text-white";
			case "DL":
				return "bg-blue-400 text-white";
			case "STAR":
				return "bg-pink-500 text-white";
			default:
				return "bg-green-100 hover:bg-green-200";
		}
	};

	const getPremiumSquareText = (premium?: string) => {
		switch (premium) {
			case "TW":
				return "TW";
			case "DW":
				return "DW";
			case "TL":
				return "TL";
			case "DL":
				return "DL";
			case "STAR":
				return "★";
			default:
				return "";
		}
	};

	return (
		<button
			className={cn(
				"relative w-full aspect-square border border-gray-300 text-xs font-bold",
				"flex items-center justify-center transition-colors duration-200",
				cell.tile
					? "bg-yellow-200 hover:bg-yellow-300"
					: getPremiumSquareClass(cell.premium),
				cell.isNew && "ring-2 ring-orange-400 ring-inset",
				onClick && "cursor-pointer"
			)}
			onClick={onClick}
			disabled={!onClick}
		>
			{cell.tile ? (
				<div className="flex flex-col items-center justify-center w-full h-full">
					<span className="text-black font-bold text-lg leading-none">
						{cell.tile.letter}
					</span>
					<span className="text-black text-xs leading-none">
						{cell.tile.points}
					</span>
				</div>
			) : (
				<span className="text-xs font-medium">
					{getPremiumSquareText(cell.premium)}
				</span>
			)}
		</button>
	);
}
