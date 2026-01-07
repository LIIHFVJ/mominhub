-- Create adhkar table
CREATE TABLE IF NOT EXISTS adhkar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    description TEXT,
    source VARCHAR(255),
    type VARCHAR(50) NOT NULL, -- 'adhkar', 'duaa', or 'ziyarat'
    order_index INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_adhkar_category ON adhkar(category);
CREATE INDEX IF NOT EXISTS idx_adhkar_type ON adhkar(type);
CREATE INDEX IF NOT EXISTS idx_adhkar_active ON adhkar(is_active);
