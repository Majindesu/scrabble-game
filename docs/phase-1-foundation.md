# Phase 1: Foundation & Game Core

**Duration**: Week 1-2  
**Status**: 🔄 Ready to Start

## Goals
Set up the basic Scrabble game structure and database schema to provide a solid foundation for all future development.

## Tasks

### 1. Database Schema Design
**Priority**: High  
**Estimated Time**: 2-3 days

#### 1.1 Core Game Tables
- **Games Table**: Store game metadata and state
  ```sql
  games (
    id, 
    status (waiting/active/finished/paused), 
    current_player_turn, 
    board_state (JSON), 
    bag_tiles (JSON),
    created_at, 
    updated_at,
    max_players,
    game_settings (JSON)
  )
  ```

- **Players Table**: Player participation in games
  ```sql
  game_players (
    id,
    game_id,
    user_id,
    player_number (1-4),
    tiles (JSON array),
    score,
    turn_order,
    is_active,
    joined_at
  )
  ```

- **Game Moves Table**: Track all moves for replay/validation
  ```sql
  game_moves (
    id,
    game_id,
    player_id,
    move_type (place_word/exchange_tiles/pass),
    word_played,
    tiles_used (JSON),
    board_positions (JSON),
    score_earned,
    timestamp
  )
  ```

#### 1.2 Dictionary and Validation Tables
- **Dictionary Table**: Valid Scrabble words
  ```sql
  dictionary (
    id,
    word,
    definition (optional),
    length,
    is_valid
  )
  ```

### 2. Core Game Logic Implementation
**Priority**: High  
**Estimated Time**: 3-4 days

#### 2.1 Scrabble Board System
- Create 15x15 grid representation
- Premium square definitions (double/triple letter/word)
- Board state serialization/deserialization
- Validation rules for tile placement

#### 2.2 Tile Management System
- Standard Scrabble tile distribution (100 tiles total)
- Tile bag management with random drawing
- Player tile rack management (7 tiles max)
- Tile exchange functionality

#### 2.3 Basic Word Validation
- Check if word exists in dictionary
- Validate word formation rules
- Cross-word validation (new words formed)
- First move must cross center star

#### 2.4 Score Calculation Algorithms
- Basic letter point values
- Premium square multipliers
- Bonus points (using all 7 tiles = 50 points)
- Total score calculation per move

### 3. Basic UI Components
**Priority**: Medium  
**Estimated Time**: 2-3 days

#### 3.1 Game Board Component
- 15x15 grid display with proper styling
- Premium square visual indicators
- Tile placement visualization
- Responsive design for different screen sizes

#### 3.2 Tile Rack Component
- Display player's current tiles
- Visual tile representations with letters and points
- Drag source for tile placement

#### 3.3 Score Display Component
- Individual player scores
- Current move score preview
- Score history/breakdown

#### 3.4 Game Info Panel
- Current turn indicator
- Remaining tiles in bag count
- Game status display
- Basic game controls

## Deliverables

### Database Schema Files
- [ ] `database/schema/games.ts`
- [ ] `database/schema/game_players.ts` 
- [ ] `database/schema/game_moves.ts`
- [ ] `database/schema/dictionary.ts`
- [ ] Migration files for all new tables

### Core Logic Modules
- [ ] `lib/game/board.ts` - Board management
- [ ] `lib/game/tiles.ts` - Tile system
- [ ] `lib/game/scoring.ts` - Score calculation
- [ ] `lib/game/validation.ts` - Word validation
- [ ] `lib/game/constants.ts` - Game constants

### UI Components
- [ ] `components/game/Board.tsx`
- [ ] `components/game/TileRack.tsx`
- [ ] `components/game/ScoreDisplay.tsx`
- [ ] `components/game/GameInfo.tsx`

### API Endpoints (tRPC)
- [ ] `createGame` - Create new game
- [ ] `getGameState` - Get current game state
- [ ] `validateWord` - Check if word is valid

## Acceptance Criteria

### Database
- [ ] All tables created with proper relationships
- [ ] Dictionary populated with valid Scrabble words
- [ ] Sample data can be inserted and queried

### Game Logic  
- [ ] Board can be initialized and tiles placed
- [ ] Tile bag distributes tiles randomly
- [ ] Basic score calculation works correctly
- [ ] Word validation against dictionary works

### UI Components
- [ ] Game board renders properly with premium squares
- [ ] Tiles display correctly in rack
- [ ] Score displays update appropriately
- [ ] Components are responsive on desktop and mobile

### Testing
- [ ] Unit tests for core game logic
- [ ] Database queries tested
- [ ] Components render without errors

## Dependencies
- [ ] Dictionary word list (can use open source Scrabble dictionary)
- [ ] Tile distribution constants
- [ ] Premium square layout constants

## Risks & Mitigation
- **Risk**: Large dictionary affects database performance
  - **Mitigation**: Index the dictionary table, consider caching frequent lookups
- **Risk**: Complex board state JSON storage
  - **Mitigation**: Define clear schema for board state, validate on save/load

## Next Phase Dependencies
This phase provides the foundation that Phase 2 will build upon for implementing interactive gameplay.
