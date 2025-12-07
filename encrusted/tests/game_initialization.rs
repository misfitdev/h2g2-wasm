mod common;

use encrusted::{Game, Options, UI};
use common::MockUI;

#[test]
fn game_initialization_succeeds() {
    let ui = MockUI::new();
    let opts = Options::default();
    let _zvm = Game::load_from_ui(ui, opts);

    assert!(true, "Game initialization should succeed");
}

#[test]
fn game_step_executes_multiple_times() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);

    for _ in 0..5 {
        zvm.step();
        zvm.ui.flush();
    }

    assert!(true, "Game should execute multiple steps without panicking");
}

#[test]
fn get_location_returns_string() {
    let ui = MockUI::new();
    let opts = Options::default();
    let zvm = Game::load_from_ui(ui, opts);
    let (_room_num, location_name) = zvm.get_current_room();
    assert!(!location_name.is_empty(), "Location name should not be empty");
}
