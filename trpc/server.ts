import type { dbPostgres } from "../database/drizzle/db";
import * as drizzleQueries from "../database/drizzle/queries/todos";
import * as gameQueries from "../database/drizzle/queries/games";
import * as dictionaryQueries from "../database/drizzle/queries/dictionary";
import { initTRPC } from "@trpc/server";
import { z } from "zod";

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<{ db: ReturnType<typeof dbPostgres> }>().create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  // Legacy demo endpoints
  demo: publicProcedure.query(async () => {
    return { demo: true };
  }),
  onNewTodo: publicProcedure
    .input((value): string => {
      if (typeof value === "string") {
        return value;
      }
      throw new Error("Input is not a string");
    })
    .mutation(async (opts) => {
      await drizzleQueries.insertTodo(opts.ctx.db, opts.input);
    }),
  onGetTodos: publicProcedure.query(async (opts) => {
    return await drizzleQueries.getAllTodos(opts.ctx.db);
  }),

  // Scrabble Game endpoints
  createGame: publicProcedure
    .input(z.object({
      maxPlayers: z.number().min(2).max(4).optional(),
      gameSettings: z.any().optional(),
    }))
    .mutation(async (opts) => {
      return await gameQueries.createGame(opts.ctx.db, opts.input);
    }),

  getGame: publicProcedure
    .input(z.object({
      gameId: z.number(),
    }))
    .query(async (opts) => {
      return await gameQueries.getGameWithPlayers(opts.ctx.db, opts.input.gameId);
    }),

  joinGame: publicProcedure
    .input(z.object({
      gameId: z.number(),
      userId: z.string(),
      playerName: z.string().optional(),
    }))
    .mutation(async (opts) => {
      return await gameQueries.addPlayerToGame(
        opts.ctx.db, 
        opts.input.gameId, 
        opts.input.userId,
        opts.input.playerName
      );
    }),

  startGame: publicProcedure
    .input(z.object({
      gameId: z.number(),
    }))
    .mutation(async (opts) => {
      return await gameQueries.startGame(opts.ctx.db, opts.input.gameId);
    }),

  validateWord: publicProcedure
    .input(z.object({
      word: z.string(),
    }))
    .query(async (opts) => {
      return await dictionaryQueries.isWordValid(opts.ctx.db, opts.input.word);
    }),

  getActiveGames: publicProcedure
    .query(async (opts) => {
      return await gameQueries.getActiveGames(opts.ctx.db);
    }),
});

export type AppRouter = typeof appRouter;
