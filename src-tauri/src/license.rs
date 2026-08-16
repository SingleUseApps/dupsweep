// Offline license validation: key = 5 groups of 4 [A-Z0-9] (the seed) plus a
// trailing 6-char hex signature, joined by dashes: XXXX-XXXX-XXXX-XXXX-XXXX-SIGSIG
// signature = first 6 hex chars (uppercase) of SHA256(seed + email + salt).
// Must match the shared license-service backend (SingleUseApps Portal) and the
// manual key-generator app (SingleUseApps-KeyGen).
use sha2::{Digest, Sha256};

const SALT: &str = "DupSweep-Secret-Salt-2026-Sweep";

pub fn validate(key: &str, email: &str) -> bool {
    let key = key.to_uppercase();
    let parts: Vec<&str> = key.split('-').collect();
    if parts.len() != 6 {
        return false;
    }
    for p in &parts[0..5] {
        if p.len() != 4 || !p.chars().all(|c| c.is_ascii_uppercase() || c.is_ascii_digit()) {
            return false;
        }
    }
    let signature = parts[5];
    if signature.len() != 6 || !signature.chars().all(|c| c.is_ascii_hexdigit()) {
        return false;
    }

    let seed: String = parts[0..5].concat();
    let email_normalized = email.trim().to_lowercase();

    let mut hasher = Sha256::new();
    hasher.update(format!("{seed}{email_normalized}{SALT}").as_bytes());
    let digest = hasher.finalize();
    let expected: String = digest.iter().map(|b| format!("{:02X}", b)).collect::<String>()[..6].to_string();

    signature == expected
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_a_correctly_signed_key() {
        // seed "A1B2C3D4E5F6G7H8J9K0" + "test@example.com" + SALT →
        // SHA256 first 6 hex chars = A118D4 (computed independently in Python).
        assert!(validate("A1B2-C3D4-E5F6-G7H8-J9K0-A118D4", "test@example.com"));
        assert!(validate("a1b2-c3d4-e5f6-g7h8-j9k0-a118d4", "test@example.com")); // case-insensitive
        assert!(validate("A1B2-C3D4-E5F6-G7H8-J9K0-A118D4", "  TEST@EXAMPLE.COM  ")); // email trimmed + lowercased
    }

    #[test]
    fn rejects_bad_signature_email_and_format() {
        assert!(!validate("A1B2-C3D4-E5F6-G7H8-J9K0-A118D4", "wrong@example.com")); // wrong email
        assert!(!validate("A1B2-C3D4-E5F6-G7H8-J9K0-XXXXXX", "test@example.com")); // wrong signature
        assert!(!validate("A1B2-C3D4-E5F6-G7H8-J9K0", "test@example.com")); // too few groups
        assert!(!validate("not-a-key", "test@example.com"));
        assert!(!validate("A1B2-C3D4-E5F6-G7H8-J9K0-A118D", "test@example.com")); // signature too short
    }
}
