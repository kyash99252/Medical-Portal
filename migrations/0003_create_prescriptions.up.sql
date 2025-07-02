CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    medication TEXT NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_patient FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_doctor FOREIGN KEY(doctor_id) REFERENCES users(id) ON DELETE SET NULL
);