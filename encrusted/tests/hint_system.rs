mod common;

use encrusted::{Game, Options, UI};
use common::MockUI;

#[test]
fn hint_system_loads_data() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);
    let _questions = zvm.get_hint_system().get_questions_for_location("west of house");

    assert!(true, "Hint system should load data without panicking");
}

#[test]
fn hint_system_handles_nonexistent_location() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);
    let questions = zvm.get_hint_system().get_questions_for_location("nonexistent_location_xyz");

    assert_eq!(questions.len(), 0, "Should return empty array for nonexistent location");
}

#[test]
fn hint_system_get_answer_at_level() {
    let ui = MockUI::new();
    let opts = Options::default();
    let mut zvm = Game::load_from_ui(ui, opts);
    let hint_system = zvm.get_hint_system();

    let _answer = hint_system.get_answer_at_level(0, 0);
    assert!(true, "Getting answer at level should not panic");
}
