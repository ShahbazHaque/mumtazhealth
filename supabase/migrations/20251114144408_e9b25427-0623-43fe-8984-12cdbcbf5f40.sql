-- Create services table for bookable offerings
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'consultation', 'workshop', 'retreat', 'training'
  duration_days INTEGER, -- for retreats and trainings
  duration_hours DECIMAL, -- for consultations and workshops
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  max_capacity INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  booking_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Services policies
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all bookings"
  ON bookings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Create updated_at triggers
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample services
INSERT INTO services (title, description, category, duration_hours, price) VALUES
('One-on-One Consultation', 'Deep personalized consultation on Ayurveda, yoga, and holistic wellness for motherhood. Includes dosha assessment and customized herbal recommendations.', 'consultation', 1.5, 150.00),
('Postpartum Wellness Workshop', 'Learn Ayurvedic practices for postpartum recovery, including nutrition, self-care rituals, and gentle yoga.', 'workshop', 3, 75.00),
('Motherhood & Balance Workshop', 'A half-day workshop on managing stress, hormonal balance, and spiritual grounding during motherhood.', 'workshop', 4, 95.00);

INSERT INTO services (title, description, category, duration_days, price) VALUES
('Sacred Motherhood Retreat', '5-day immersive retreat focusing on Ayurveda, yoga, meditation, and spiritual practices for mothers. Includes accommodation, meals, and all sessions.', 'retreat', 5, 1500.00),
('Prenatal Wellness Retreat', '3-day retreat for expecting mothers. Gentle prenatal yoga, Ayurvedic nutrition, and preparation for sacred childbirth.', 'retreat', 3, 850.00),
('200-Hour Yoga Teacher Training', 'Comprehensive yoga teacher training covering asana, pranayama, philosophy, Ayurveda, and teaching methodology. Certified program.', 'training', 30, 3500.00),
('300-Hour Advanced Yoga Training', 'Advanced training for certified teachers. Deep dive into therapeutic yoga, prenatal/postnatal specialization, and Ayurvedic integration.', 'training', 45, 4500.00);