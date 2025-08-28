import { dbPostgres } from '../database/drizzle/db.js';
import { dictionary } from '../database/drizzle/schema/dictionary.js';
import { BASIC_SCRABBLE_WORDS } from '../lib/game/dictionary.js';

async function seedDictionary() {
  console.log('Starting dictionary seeding...');
  
  const db = dbPostgres();
  
  try {
    // Clear existing dictionary data
    await db.delete(dictionary);
    console.log('Cleared existing dictionary data');

    // Insert words in batches
    const batchSize = 100;
    let totalInserted = 0;

    for (let i = 0; i < BASIC_SCRABBLE_WORDS.length; i += batchSize) {
      const batch = BASIC_SCRABBLE_WORDS.slice(i, i + batchSize);
      const wordsToInsert = batch.map(word => ({
        word: word.toUpperCase(),
        length: word.length,
        isValid: true
      }));

      await db.insert(dictionary).values(wordsToInsert);
      totalInserted += wordsToInsert.length;
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${wordsToInsert.length} words`);
    }

    console.log(`✅ Successfully seeded dictionary with ${totalInserted} words!`);
  } catch (error) {
    console.error('❌ Error seeding dictionary:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDictionary();
