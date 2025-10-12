-- Pokemon Card Collection Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  avatar TEXT
);

-- Collection cards table
CREATE TABLE IF NOT EXISTS collection_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL, -- Pokemon TCG API card ID
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  condition TEXT NOT NULL CHECK (condition IN ('mint', 'near-mint', 'excellent', 'good', 'played', 'poor')),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_collection_cards_user_id ON collection_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_cards_card_id ON collection_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_collection_cards_added_at ON collection_cards(added_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_collection_cards_user_card ON collection_cards(user_id, card_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_collection_cards_updated_at
  BEFORE UPDATE ON collection_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now since we don't have auth yet)
-- These will be updated when we add authentication in Phase 2
CREATE POLICY "Allow all access to users" ON users
  FOR ALL USING (true);

CREATE POLICY "Allow all access to collection_cards" ON collection_cards
  FOR ALL USING (true);

-- Comments for documentation
COMMENT ON TABLE users IS 'Stores user profiles (simple name-based for Phase 1)';
COMMENT ON TABLE collection_cards IS 'Stores user card collections with references to Pokemon TCG API';
COMMENT ON COLUMN collection_cards.card_id IS 'Pokemon TCG API card ID (e.g., "xy1-1")';
COMMENT ON COLUMN collection_cards.condition IS 'Physical condition of the card';
COMMENT ON COLUMN collection_cards.quantity IS 'Number of this card owned (for duplicates)';