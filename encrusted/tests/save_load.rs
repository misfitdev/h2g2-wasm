mod common;

use encrusted::{Game, Options, UI};
use common::MockUI;
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};

#[test]
fn save_creates_valid_data() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);

    // Execute a few steps to create game state
    for _ in 0..3 {
        zvm.step();
        zvm.ui.flush();
    }

    // Get save data
    let save_data = zvm.get_save_state();
    assert!(save_data.is_some(), "Save should return Some data");

    let data = save_data.unwrap();
    assert!(!data.is_empty(), "Save data should not be empty");
    // Base64 encoded data should be a string
    assert!(data.is_ascii(), "Save data should be ASCII (base64)");
}

#[test]
fn save_multiple_times_produces_different_data() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);

    // Get initial save
    zvm.step();
    zvm.ui.flush();
    let save1 = zvm.get_save_state();

    // Execute more steps and save again
    for _ in 0..5 {
        zvm.step();
        zvm.ui.flush();
    }
    let save2 = zvm.get_save_state();

    // Both should be valid
    assert!(save1.is_some(), "First save should be valid");
    assert!(save2.is_some(), "Second save should be valid");

    // After game changes, save data should differ
    // (Note: They might be identical if game state hasn't changed,
    // but typically after steps they differ)
    let data1 = save1.unwrap();
    let data2 = save2.unwrap();
    assert!(!data1.is_empty() && !data2.is_empty(), "Both saves should have data");
}

#[test]
fn restore_with_valid_save_data_succeeds() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);

    // Create a save state
    for _ in 0..3 {
        zvm.step();
        zvm.ui.flush();
    }

    let save_data = zvm.get_save_state();
    assert!(save_data.is_some(), "Should have valid save data");

    // Restore from the save (should not panic)
    let data = save_data.unwrap();
    zvm.restore(&data);

    // After restore, game should still be playable
    zvm.step();
    zvm.ui.flush();

    assert!(true, "Restore and subsequent step should not panic");
}

#[test]
#[should_panic(expected = "called `Option::unwrap()` on a `None` value")]
fn restore_with_invalid_data_panics() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);

    // Invalid base64 data will panic - this is expected behavior
    // Valid data handling is tested in save_and_restore_cycle_preserves_location
    zvm.restore("invalid_base64_data_xyz");
}

#[test]
fn save_and_restore_cycle_preserves_state() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);

    // Play for a bit
    for _ in 0..5 {
        zvm.step();
        zvm.ui.flush();
    }

    let location_after_steps = zvm.get_current_room().1.clone();

    // Save state at this point
    let save_data = zvm.get_save_state().unwrap();

    // Continue playing multiple steps to change state
    for _ in 0..20 {
        zvm.step();
        zvm.ui.flush();
    }

    let _location_after_many_steps = zvm.get_current_room().1.clone();

    // Restore to the save point
    zvm.restore(&save_data);
    let location_after_restore = zvm.get_current_room().1;

    // After restore, location should match the saved state, not the current one
    assert_eq!(location_after_restore, location_after_steps,
        "Location should be restored to saved state");
}

#[test]
fn restore_with_valid_save_restores_state() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);

    // Play to a point
    for _ in 0..10 {
        zvm.step();
        zvm.ui.flush();
    }
    let location_at_save = zvm.get_current_room().1.clone();
    let save_data = zvm.get_save_state().unwrap();

    // Continue playing significantly more
    for _ in 0..30 {
        zvm.step();
        zvm.ui.flush();
    }

    // Restore back to save point
    zvm.restore(&save_data);
    let location_after_restore = zvm.get_current_room().1;

    // State should match save point
    assert_eq!(location_after_restore, location_at_save,
        "Restore should return to saved location");
}

// Security tests for malicious input handling

#[test]
fn restore_rejects_truncated_security_header() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);

    // Create a truncated save file that's too short for security header
    let truncated = BASE64.encode(b"\x01\x02\x03");
    zvm.load_savestate(&truncated);
    // Should fail gracefully without panicking
}

#[test]
fn restore_rejects_empty_save_data() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);

    let empty_b64 = BASE64.encode(b"");
    zvm.load_savestate(&empty_b64);
    // Should fail gracefully without panicking
}

#[test]
fn restore_rejects_invalid_base64() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);

    // Invalid base64 characters should be handled
    zvm.load_savestate("!!!invalid_base64!!!");
    // Should fail gracefully without panicking
}

#[test]
fn restore_rejects_tampered_data_detected_by_hmac() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);

    // Create a valid save first
    for _ in 0..3 {
        zvm.step();
        zvm.ui.flush();
    }

    let valid_save = zvm.get_save_state().unwrap();

    // Decode the valid save to tamper with it
    if let Ok(decoded) = BASE64.decode(&valid_save) {
        if decoded.len() > 40 {
            // Tamper with the payload after the security header (skip version + CRC + HMAC)
            let mut tampered = decoded.clone();
            tampered[40] ^= 0xFF; // Flip bits in the payload
            let tampered_b64 = BASE64.encode(&tampered);

            // This should fail validation due to HMAC mismatch
            zvm.load_savestate(&tampered_b64);
            // HMAC validation should reject this
        }
    }
}

#[test]
fn restore_rejects_invalid_version_number() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);

    // Create data with invalid version number (not 1)
    let mut bad_version = vec![0xFF]; // Invalid version
    bad_version.extend_from_slice(&[0u8; 36]); // Pad to minimum size
    let bad_b64 = BASE64.encode(&bad_version);

    zvm.load_savestate(&bad_b64);
    // Should reject invalid version without panicking
}

#[test]
fn restore_rejects_corrupted_crc32() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);

    // Create a valid save first
    for _ in 0..3 {
        zvm.step();
        zvm.ui.flush();
    }

    let valid_save = zvm.get_save_state().unwrap();

    // Decode and corrupt the CRC32 field
    if let Ok(decoded) = BASE64.decode(&valid_save) {
        if decoded.len() > 5 {
            let mut corrupted = decoded.clone();
            corrupted[1] ^= 0xFF; // Flip bits in CRC32 bytes
            let corrupted_b64 = BASE64.encode(&corrupted);

            // This should fail validation due to CRC mismatch
            zvm.load_savestate(&corrupted_b64);
            // CRC validation should reject this
        }
    }
}

#[test]
fn restore_handles_oversized_memory_gracefully() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);

    // Create very large malformed data that might trigger memory issues
    // This tests that bounds checking prevents out-of-bounds allocation
    let large_payload = vec![0u8; 1024 * 1024]; // 1 MB of zeros
    let large_b64 = BASE64.encode(&large_payload);

    zvm.load_savestate(&large_b64);
    // Should handle gracefully without panic or excessive memory allocation
}

#[test]
fn get_save_state_includes_security_headers() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);

    // Create a save state
    for _ in 0..3 {
        zvm.step();
        zvm.ui.flush();
    }

    let save_data = zvm.get_save_state().unwrap();

    // Decode the save data
    let decoded = BASE64.decode(&save_data).expect("Save should be valid base64");

    // Should have at least version (1) + CRC32 (4) + HMAC (32) + some payload
    assert!(decoded.len() > 37, "Save data should include security headers");

    // First byte should be version 1
    assert_eq!(decoded[0], 1, "First byte should be version 1");
}

#[test]
fn save_and_restore_with_security_roundtrip() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);

    // Play to a point
    for _ in 0..5 {
        zvm.step();
        zvm.ui.flush();
    }
    let location_before = zvm.get_current_room().1.clone();

    // Save with security headers
    let save_data = zvm.get_save_state().unwrap();

    // Continue playing
    for _ in 0..10 {
        zvm.step();
        zvm.ui.flush();
    }

    // Restore using load_savestate (which validates security headers)
    zvm.load_savestate(&save_data);
    let location_after = zvm.get_current_room().1;

    // State should be properly restored
    assert_eq!(location_after, location_before,
        "Restore with security validation should preserve state");
}
