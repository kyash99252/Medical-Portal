CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('receptionist', 'doctor'))
);

CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    phone_number VARCHAR(25),
    address TEXT NOT NULL,
    diagnosis TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Seed initial users
-- Password for both is 'password123'
INSERT INTO users (username, password_hash, role) VALUES
('receptionist', '$2y$10$T1idEec.BiY/4j2fvrXUZ.sOFufq9HF2TfJuAvk84o3X6MZ8PGoA6', 'receptionist'),
('doctor', '$2y$10$T1idEec.BiY/4j2fvrXUZ.sOFufq9HF2TfJuAvk84o3X6MZ8PGoA6', 'doctor');

INSERT INTO patients (name, age, address, phone_number) VALUES
('John Doe', 45, '123 Main St, Anytown, USA', '123456789'),
('Jane Smith', 34, '456 Oak Ave, Sometown, USA', '123456780');