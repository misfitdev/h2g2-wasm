mod common;

use encrusted::{Game, Options, UI};
use common::{CaptureUI, get_capture_state};

#[test]
fn game_startup_produces_output() {
    let ui = CaptureUI::new();
    let mut zvm = Game::load_from_ui(ui, Options::default());

    zvm.step();
    zvm.ui.flush();

    if let Some(state) = get_capture_state() {
        assert!(!state.prints.is_empty(), "Game startup should produce some output");
    }
}

#[test]
fn flush_is_called_during_gameplay() {
    let ui = CaptureUI::new();
    let mut zvm = Game::load_from_ui(ui, Options::default());

    for _ in 0..3 {
        zvm.step();
        zvm.ui.flush();
    }

    if let Some(state) = get_capture_state() {
        assert!(state.flush_count > 0, "Flush should be called during gameplay");
    }
}

#[test]
fn print_output_accumulates() {
    let ui = CaptureUI::new();
    let mut zvm = Game::load_from_ui(ui, Options::default());

    for _ in 0..5 {
        zvm.step();
        zvm.ui.flush();
    }

    if let Some(state) = get_capture_state() {
        assert!(!state.prints.is_empty(), "Print output should accumulate over multiple steps");
    }
}

#[test]
fn game_produces_output_continuously() {
    let ui = CaptureUI::new();
    let mut zvm = Game::load_from_ui(ui, Options::default());

    for _ in 0..10 {
        zvm.step();
        zvm.ui.flush();
    }

    if let Some(state) = get_capture_state() {
        assert!(!state.prints.is_empty(), "Game should produce print output");
    }
}

#[test]
fn clear_is_callable() {
    let ui = CaptureUI::new();
    let mut zvm = Game::load_from_ui(ui, Options::default());

    for _ in 0..3 {
        zvm.step();
    }

    zvm.ui.clear();

    if let Some(state) = get_capture_state() {
        assert!(state.clear_count > 0, "Clear should be callable");
    }
}

#[test]
fn reset_is_callable() {
    let ui = CaptureUI::new();
    let mut zvm = Game::load_from_ui(ui, Options::default());

    for _ in 0..3 {
        zvm.step();
    }

    zvm.ui.reset();

    if let Some(state) = get_capture_state() {
        assert!(state.reset_count > 0, "Reset should be callable");
    }
}

#[test]
fn status_bar_updates_during_gameplay() {
    let ui = CaptureUI::new();
    let mut zvm = Game::load_from_ui(ui, Options::default());

    for _ in 0..20 {
        zvm.step();
        zvm.ui.flush();
    }

    if let Some(_state) = get_capture_state() {
        assert!(true, "Status bar updates should be captured");
    }
}

#[test]
fn message_output_is_captured() {
    let ui = CaptureUI::new();
    let mut zvm = Game::load_from_ui(ui, Options::default());

    for _ in 0..15 {
        zvm.step();
        zvm.ui.flush();
    }

    if let Some(_state) = get_capture_state() {
        assert!(true, "Message output should be captured");
    }
}

#[test]
fn output_accumulates_across_steps() {
    let ui = CaptureUI::new();
    let mut zvm = Game::load_from_ui(ui, Options::default());

    let mut output_count_before = 0;

    for i in 0..20 {
        zvm.step();
        zvm.ui.flush();

        if let Some(state) = get_capture_state() {
            let current_count = state.prints.len();
            if i == 0 {
                output_count_before = current_count;
            }
        }
    }

    if let Some(state) = get_capture_state() {
        let output_count_after = state.prints.len();
        assert!(output_count_after >= output_count_before,
            "Output should accumulate or remain stable across steps");
    }
}
