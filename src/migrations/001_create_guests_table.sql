CREATE TABLE IF NOT EXISTS guests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  invitation_type ENUM('individual', 'pareja', 'cupos') NOT NULL DEFAULT 'individual',
  partner_name VARCHAR(255) NULL,
  seats INT NOT NULL DEFAULT 1,
  rsvp ENUM('pending', 'confirmed', 'declined') NOT NULL DEFAULT 'pending',
  attendees INT NOT NULL DEFAULT 0,
  responded_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_guests_full_name UNIQUE (full_name),
  CONSTRAINT uq_guests_slug UNIQUE (slug),
  INDEX idx_guests_slug (slug)
) ENGINE=InnoDB;
