CREATE TABLE "dictionary" (
	"id" serial PRIMARY KEY NOT NULL,
	"word" varchar(15) NOT NULL,
	"definition" text,
	"length" integer NOT NULL,
	"is_valid" boolean DEFAULT true NOT NULL,
	CONSTRAINT "dictionary_word_unique" UNIQUE("word")
);
--> statement-breakpoint
CREATE TABLE "game_moves" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"move_type" varchar(20) NOT NULL,
	"word_played" varchar(15),
	"tiles_used" jsonb,
	"board_positions" jsonb,
	"score_earned" integer DEFAULT 0 NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_players" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"player_number" integer NOT NULL,
	"tiles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"turn_order" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" varchar(20) DEFAULT 'waiting' NOT NULL,
	"current_player_turn" integer,
	"board_state" jsonb NOT NULL,
	"bag_tiles" jsonb NOT NULL,
	"max_players" integer DEFAULT 4 NOT NULL,
	"game_settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_moves" ADD CONSTRAINT "game_moves_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_moves" ADD CONSTRAINT "game_moves_player_id_game_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."game_players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_players" ADD CONSTRAINT "game_players_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "word_idx" ON "dictionary" USING btree ("word");--> statement-breakpoint
CREATE INDEX "length_idx" ON "dictionary" USING btree ("length");