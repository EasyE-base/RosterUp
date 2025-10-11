/*
  # Create Notifications System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `type` (text) - notification type (message, tryout_application, team_invitation, etc.)
      - `title` (text)
      - `message` (text)
      - `link` (text) - optional link to related resource
      - `is_read` (boolean)
      - `created_at` (timestamptz)
      - `metadata` (jsonb) - additional data

  2. Security
    - Enable RLS
    - Users can only see their own notifications
    - Users can update their own notifications (mark as read)
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- RLS Policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to create notification for new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id uuid;
  sender_name text;
BEGIN
  -- Get recipient (the other participant in the conversation)
  SELECT user_id INTO recipient_id
  FROM conversation_participants
  WHERE conversation_id = NEW.conversation_id
  AND user_id != NEW.sender_id
  LIMIT 1;

  -- Get sender name
  SELECT full_name INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Create notification for recipient
  IF recipient_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      recipient_id,
      'new_message',
      'New Message',
      sender_name || ' sent you a message',
      '/messages'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new messages
DROP TRIGGER IF EXISTS notify_new_message_trigger ON messages;
CREATE TRIGGER notify_new_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Function to create notification for new tryout application
CREATE OR REPLACE FUNCTION notify_tryout_application()
RETURNS TRIGGER AS $$
DECLARE
  team_id uuid;
  org_user_id uuid;
  player_name text;
  team_name text;
BEGIN
  -- Get team and organization info
  SELECT tryouts.team_id INTO team_id
  FROM tryouts
  WHERE tryouts.id = NEW.tryout_id;

  SELECT organizations.user_id INTO org_user_id
  FROM teams
  JOIN organizations ON teams.organization_id = organizations.id
  WHERE teams.id = team_id;

  -- Get player name
  SELECT profiles.full_name INTO player_name
  FROM players
  JOIN profiles ON players.user_id = profiles.id
  WHERE players.id = NEW.player_id;

  -- Get team name
  SELECT teams.name INTO team_name
  FROM teams
  WHERE teams.id = team_id;

  -- Create notification for organization
  IF org_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      org_user_id,
      'tryout_application',
      'New Tryout Application',
      player_name || ' applied for ' || team_name || ' tryout',
      '/tryouts/' || NEW.tryout_id || '/applications',
      jsonb_build_object('application_id', NEW.id, 'player_id', NEW.player_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new tryout applications
DROP TRIGGER IF EXISTS notify_tryout_application_trigger ON tryout_applications;
CREATE TRIGGER notify_tryout_application_trigger
  AFTER INSERT ON tryout_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_tryout_application();

-- Function to notify player of application status update
CREATE OR REPLACE FUNCTION notify_application_status_update()
RETURNS TRIGGER AS $$
DECLARE
  player_user_id uuid;
  team_name text;
BEGIN
  -- Only notify if status changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get player's user_id
  SELECT user_id INTO player_user_id
  FROM players
  WHERE id = NEW.player_id;

  -- Get team name
  SELECT teams.name INTO team_name
  FROM tryouts
  JOIN teams ON tryouts.team_id = teams.id
  WHERE tryouts.id = NEW.tryout_id;

  -- Create notification for player
  IF player_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      player_user_id,
      'application_status_update',
      'Application Update',
      'Your application for ' || team_name || ' has been ' || NEW.status,
      '/tryouts',
      jsonb_build_object('status', NEW.status, 'tryout_id', NEW.tryout_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for application status updates
DROP TRIGGER IF EXISTS notify_application_status_update_trigger ON tryout_applications;
CREATE TRIGGER notify_application_status_update_trigger
  AFTER UPDATE ON tryout_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_status_update();
