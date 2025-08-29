CREATE TABLE "game_moves_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" varchar(255) NOT NULL,
	"player_id" varchar(255) NOT NULL,
	"player_name" varchar(255) NOT NULL,
	"move_number" integer NOT NULL,
	"move_type" varchar(50) NOT NULL,
	"word" varchar(100),
	"score" integer DEFAULT 0 NOT NULL,
	"tiles" json,
	"positions" json,
	"board_state" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_moves" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "game_moves" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "game_moves" ALTER COLUMN "game_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "game_moves" ALTER COLUMN "player_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "game_moves" ALTER COLUMN "move_type" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "game_history" ALTER COLUMN "completed_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "game_moves" ADD COLUMN "word_played" varchar(15);--> statement-breakpoint
ALTER TABLE "game_moves" ADD COLUMN "tiles_used" jsonb;--> statement-breakpoint
ALTER TABLE "game_moves" ADD COLUMN "board_positions" jsonb;--> statement-breakpoint
ALTER TABLE "game_moves" ADD COLUMN "score_earned" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "game_moves" ADD CONSTRAINT "game_moves_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_moves" ADD CONSTRAINT "game_moves_player_id_game_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."game_players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_moves" DROP COLUMN "player_name";--> statement-breakpoint
ALTER TABLE "game_moves" DROP COLUMN "move_number";--> statement-breakpoint
ALTER TABLE "game_moves" DROP COLUMN "word";--> statement-breakpoint
ALTER TABLE "game_moves" DROP COLUMN "score";--> statement-breakpoint
ALTER TABLE "game_moves" DROP COLUMN "tiles";--> statement-breakpoint
ALTER TABLE "game_moves" DROP COLUMN "board_state";