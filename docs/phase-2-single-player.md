# Phase 2: Single Player Mechanics

**Duration**: Week 3  
**Status**: ⏳ Waiting for Phase 1

## Goals
Implement full single-player Scrabble functionality with interactive gameplay, ensuring all core Scrabble rules are properly implemented before adding multiplayer complexity.

## Prerequisites
- Phase 1 completed: Database schema, basic game logic, and UI components ready
- Dictionary system functional
- Core scoring algorithms implemented

## Tasks

### 1. Interactive Game Mechanics
**Priority**: High  
**Estimated Time**: 2-3 days

#### 1.1 Drag & Drop Tile Placement
- Implement drag and drop from tile rack to board
- Visual feedback during drag operation
- Snap-to-grid functionality
- Prevent invalid placements
- Return tiles to rack when invalid

#### 1.2 Word Formation Interface
- Real-time word preview during tile placement
- Visual indication of word boundaries
- Show score calculation as user places tiles
- Undo/redo tile placement

#### 1.3 Turn Management System
- Turn-based game flow
- Turn timer (optional for single player)
- Move validation before turn completion
- Automatic turn progression

### 2. Complete Game Rules Implementation
**Priority**: High  
**Estimated Time**: 2-3 days

#### 2.1 Advanced Word Validation
- Ensure all placed tiles form valid words
- Cross-word validation (perpendicular words created)
- Connection requirement (new tiles must connect to existing)
- First move must cross center star (H8)

#### 2.2 Premium Square Logic
- Double/Triple letter score application
- Double/Triple word score application
- Premium squares only apply when tile first placed
- Multiple word multipliers in single move

#### 2.3 Special Game Rules
- Using all 7 tiles bonus (50 points)
- Blank tile handling (can represent any letter)
- Challenge system (for invalid words)
- Pass turn option

#### 2.4 End Game Conditions
- Game ends when tiles exhausted or consecutive passes
- Final scoring with remaining tile deductions
- Winner determination

### 3. Enhanced User Interface
**Priority**: Medium  
**Estimated Time**: 2 days

#### 3.1 Improved Board Interaction
- Hover effects for valid placement positions
- Visual indicators for premium squares
- Recently placed tiles highlighting
- Word score overlay during placement

#### 3.2 Tile Exchange System
- Interface for selecting tiles to exchange
- Exchange confirmation dialog
- Visual feedback for exchange process
- Turn consumption for exchanges

#### 3.3 Game Controls
- Submit move button
- Pass turn button
- Exchange tiles button
- Shuffle tile rack button
- Recall tiles button (before submission)

#### 3.4 Move History & Feedback
- Display previous moves
- Score breakdown for each move
- Invalid move error messages
- Move suggestion hints (optional)

## Deliverables

### Enhanced Game Logic
- [ ] `lib/game/dragDrop.ts` - Drag and drop management
- [ ] `lib/game/turnManager.ts` - Turn-based game flow
- [ ] `lib/game/wordValidator.ts` - Complete word validation
- [ ] `lib/game/premiumSquares.ts` - Premium square logic
- [ ] `lib/game/endGame.ts` - End game conditions

### Interactive Components
- [ ] `components/game/InteractiveBoard.tsx` - Drag/drop enabled board
- [ ] `components/game/InteractiveTileRack.tsx` - Draggable tiles
- [ ] `components/game/GameControls.tsx` - Move controls
- [ ] `components/game/MoveHistory.tsx` - Previous moves display
- [ ] `components/game/TileExchange.tsx` - Exchange interface

### Game Flow Components  
- [ ] `components/game/TurnIndicator.tsx` - Whose turn display
- [ ] `components/game/MoveValidation.tsx` - Error/success messages
- [ ] `components/game/ScoreBreakdown.tsx` - Detailed scoring
- [ ] `components/game/GameEndModal.tsx` - End game results

### API Endpoints (tRPC)
- [ ] `makeMove` - Submit player move
- [ ] `exchangeTiles` - Exchange selected tiles  
- [ ] `passTurn` - Pass current turn
- [ ] `validateMove` - Validate move before submission
- [ ] `getWordDefinition` - Get word meanings (optional)

### Game Pages
- [ ] `/game/[gameId]` - Main game page
- [ ] Enhanced routing for game-specific pages

## Acceptance Criteria

### Core Gameplay
- [ ] Player can drag tiles from rack to board
- [ ] All valid Scrabble words are accepted
- [ ] Invalid words are rejected with clear feedback
- [ ] Score calculation is accurate for all scenarios
- [ ] Premium squares work correctly

### User Experience
- [ ] Smooth drag and drop with visual feedback
- [ ] Clear indication of valid/invalid moves
- [ ] Score preview updates in real-time
- [ ] Error messages are helpful and clear
- [ ] Game controls are intuitive

### Game Rules Compliance
- [ ] First move must cross center star
- [ ] All tiles must connect to existing tiles
- [ ] Cross-words are validated
- [ ] Blank tiles can be assigned any letter
- [ ] 50-point bonus for using all 7 tiles

### Performance
- [ ] Board renders smoothly with animations
- [ ] Word validation is fast (<100ms)
- [ ] Drag operations don't cause lag
- [ ] Database updates are efficient

### Testing
- [ ] All game rules have test coverage
- [ ] Edge cases are handled (unusual tile placements)
- [ ] Error states are tested
- [ ] Performance tests for word validation

## User Flows

### Starting a Game
1. Navigate to new game page
2. Game initializes with shuffled tiles
3. Player gets 7 tiles in rack
4. Board shows empty 15x15 grid

### Making a Move
1. Drag tiles from rack to board
2. See real-time score preview
3. Click submit move button
4. Move validated and score applied
5. New tiles drawn from bag

### Handling Invalid Moves
1. Player places invalid word
2. System shows specific error message
3. Tiles return to rack
4. Player can try again

### Ending a Game
1. Game ends when conditions met
2. Final scores calculated
3. Winner declared
4. Option to play again

## Risks & Mitigation

- **Risk**: Drag and drop performance issues on mobile
  - **Mitigation**: Implement touch-specific optimizations, test on various devices

- **Risk**: Complex word validation slows gameplay
  - **Mitigation**: Implement caching, optimize dictionary queries

- **Risk**: Premium square logic becomes complex
  - **Mitigation**: Create comprehensive test cases, clear documentation

## Notes for Next Phase
- Single player experience should be polished before multiplayer
- Consider AI opponent as bridge to multiplayer (optional)
- Game state management patterns established here will be crucial for multiplayer
