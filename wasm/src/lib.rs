use std::cell::RefCell;
use wasm_bindgen::prelude::*;

use encrusted::{Game, Options, UI, Zmachine};

// Thread-local game instance
thread_local!(static ZVM: RefCell<Option<Zmachine>> = RefCell::new(None));

// Thread-local message store
thread_local!(static MESSAGE_STORE: RefCell<std::collections::HashMap<String, String>> = RefCell::new(std::collections::HashMap::new()));

/// Store a message from the game UI
#[wasm_bindgen]
pub fn store_message(msg_type: String, message: String) {
    MESSAGE_STORE.with(|store| {
        store.borrow_mut().insert(msg_type, message);
    });
}

/// Get stored messages as JSON
#[wasm_bindgen]
pub fn get_messages() -> String {
    MESSAGE_STORE.with(|store| {
        let messages = store.borrow();
        serde_json::to_string(&*messages).unwrap_or_else(|_| "{}".to_string())
    })
}

/// Clear all stored messages
#[wasm_bindgen]
pub fn clear_messages() {
    MESSAGE_STORE.with(|store| {
        store.borrow_mut().clear();
    });
}

/// Execute function with mutable access to the game instance
fn with<F, R>(func: F) -> R
where
    F: FnOnce(&mut Zmachine) -> R,
{
    ZVM.with(|cell| {
        let mut wrapper = cell.borrow_mut();
        let zvm: &mut Zmachine = wrapper
            .as_mut()
            .expect("Game instance not initialized");
        func(zvm)
    })
}

/// Send game state updates to JavaScript
fn push_updates(zvm: &mut Zmachine) {
    let map = serde_json::to_string(&zvm.get_current_room())
        .unwrap_or_else(|_| "{}".to_string());
    let tree = serde_json::to_string(&zvm.get_object_tree())
        .unwrap_or_else(|_| "{}".to_string());

    zvm.update_status_bar();
    zvm.ui.message("map", &map);
    zvm.ui.message("tree", &tree);
}

/// Initialize the game
#[wasm_bindgen]
pub fn create() {
    ZVM.with(|cell| {
        let ui = encrusted::ui_web::WebUI::new();
        let opts = Options::default();
        let zvm = Game::load_from_ui(ui, opts);
        *cell.borrow_mut() = Some(zvm);
    });
}

/// Execute one step of the game
#[wasm_bindgen]
pub fn step() -> bool {
    with(|zvm| {
        let done = zvm.step();
        zvm.ui.flush();
        push_updates(zvm);
        done
    })
}

/// Send player input to the game
#[wasm_bindgen]
pub fn feed(input: String) {
    with(|zvm| zvm.handle_input(input));
}

/// Save game state
#[wasm_bindgen]
pub fn save() -> Option<String> {
    with(|zvm| zvm.get_save_state())
}

/// Restore game from base64 save state
#[wasm_bindgen]
pub fn restore(b64_data: String) {
    with(|zvm| zvm.restore(&b64_data));
}

/// Load save state from base64
#[wasm_bindgen]
pub fn load_savestate(b64_data: String) {
    with(|zvm| zvm.load_savestate(&b64_data));
}

/// Get current game updates
#[wasm_bindgen]
pub fn get_updates() {
    with(|zvm| push_updates(zvm));
}

/// Get ASCII art for current room
#[wasm_bindgen]
pub fn get_room_ascii_art() -> Option<String> {
    with(|zvm| zvm.get_current_room_ascii_art().map(|s| s.to_string()))
}

/// Undo last move
#[wasm_bindgen]
pub fn undo() -> bool {
    with(|zvm| zvm.undo())
}

/// Redo last undone move
#[wasm_bindgen]
pub fn redo() -> bool {
    with(|zvm| zvm.redo())
}

/// Get current location name
#[wasm_bindgen]
pub fn get_location() -> String {
    ZVM.with(|cell| {
        if let Some(zvm) = cell.borrow_mut().as_mut() {
            let (_, name) = zvm.get_current_room();
            name
        } else {
            String::new()
        }
    })
}

/// Get hint questions for a location as JSON
#[wasm_bindgen]
pub fn get_hints_for_location(location: String) -> String {
    ZVM.with(|cell| {
        if let Some(zvm) = cell.borrow_mut().as_mut() {
            let questions = zvm.get_hint_system().get_questions_for_location(&location);
            serde_json::to_string(&questions).unwrap_or_else(|_| "[]".to_string())
        } else {
            "[]".to_string()
        }
    })
}

/// Get specific hint answer at a level
#[wasm_bindgen]
pub fn get_hint_answer(question_idx: usize, level: usize) -> Option<String> {
    ZVM.with(|cell| {
        if let Some(zvm) = cell.borrow_mut().as_mut() {
            zvm.get_hint_system().get_answer_at_level(question_idx, level)
        } else {
            None
        }
    })
}
