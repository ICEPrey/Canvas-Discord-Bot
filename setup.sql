-- Schools table
CREATE TABLE
  schools (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    NAME TEXT NOT NULL,
    canvas_domain TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

-- Users table
CREATE TABLE
  users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    discord_id BIGINT UNIQUE NOT NULL,
    canvas_user_id BIGINT,
    canvas_api_token TEXT,
    school_id BIGINT REFERENCES schools (id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

-- User preferences table
CREATE TABLE
  user_preferences (
    user_id BIGINT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    notification_assignments BOOLEAN DEFAULT TRUE,
    notification_announcements BOOLEAN DEFAULT TRUE,
    notification_grades BOOLEAN DEFAULT TRUE,
    dm_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

-- Function to update the 'updated_at' column
CREATE
OR REPLACE FUNCTION update_modified_column () RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Function to create default user preferences
CREATE
OR REPLACE FUNCTION create_default_user_preferences () RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggers to automatically update 'updated_at'
CREATE TRIGGER update_schools_modtime BEFORE
UPDATE ON schools FOR EACH ROW
EXECUTE FUNCTION update_modified_column ();

CREATE TRIGGER update_users_modtime BEFORE
UPDATE ON users FOR EACH ROW
EXECUTE FUNCTION update_modified_column ();

CREATE TRIGGER update_user_preferences_modtime BEFORE
UPDATE ON user_preferences FOR EACH ROW
EXECUTE FUNCTION update_modified_column ();

-- Trigger to create default user preferences when a new user is inserted
CREATE TRIGGER create_user_preferences_trigger
AFTER INSERT ON users FOR EACH ROW
EXECUTE FUNCTION create_default_user_preferences ();

ALTER TABLE schools ADD CONSTRAINT unique_canvas_domain UNIQUE (canvas_domain);
ALTER TABLE users ALTER COLUMN canvas_api_token TYPE TEXT;