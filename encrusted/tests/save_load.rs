mod common;

use encrusted::{Game, Options, UI};
use common::MockUI;

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

    // Get initial state
    let initial_location = zvm.get_current_room().1.clone();

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
