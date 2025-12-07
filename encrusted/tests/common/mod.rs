use encrusted::UI;
use std::boxed::Box;
use std::cell::RefCell;

/// Mock UI for testing that doesn't require JavaScript bindings
pub struct MockUI;

impl UI for MockUI {
    fn new() -> Box<Self> {
        Box::new(MockUI)
    }

    fn print(&mut self, _text: &str) {}
    fn debug(&mut self, _text: &str) {}
    fn print_object(&mut self, _obj: &str) {}
    fn print_ascii_art(&mut self, _art: &str) {}
    fn flush(&mut self) {}
    fn set_status_bar(&self, _left: &str, _right: &str) {}
    fn message(&self, _mtype: &str, _msg: &str) {}
    fn clear(&self) {}
    fn reset(&self) {}
    fn get_user_input(&self) -> String {
        String::new()
    }
}

thread_local! {
    static CAPTURE_UI_STATE: RefCell<Option<CaptureUIState>> = RefCell::new(None);
}

#[derive(Clone)]
pub struct CaptureUIState {
    pub prints: Vec<String>,
    pub debugs: Vec<String>,
    pub objects: Vec<String>,
    pub ascii_arts: Vec<String>,
    pub status_bars: Vec<(String, String)>,
    pub messages: Vec<(String, String)>,
    pub flush_count: usize,
    pub clear_count: usize,
    pub reset_count: usize,
}

impl CaptureUIState {
    fn new() -> Self {
        CaptureUIState {
            prints: Vec::new(),
            debugs: Vec::new(),
            objects: Vec::new(),
            ascii_arts: Vec::new(),
            status_bars: Vec::new(),
            messages: Vec::new(),
            flush_count: 0,
            clear_count: 0,
            reset_count: 0,
        }
    }
}

/// Capture UI for testing that records all output method calls
pub struct CaptureUI;

pub fn get_capture_state() -> Option<CaptureUIState> {
    CAPTURE_UI_STATE.with(|state| state.borrow().clone())
}

impl UI for CaptureUI {
    fn new() -> Box<Self> {
        CAPTURE_UI_STATE.with(|state| {
            *state.borrow_mut() = Some(CaptureUIState::new());
        });
        Box::new(CaptureUI)
    }

    fn print(&mut self, text: &str) {
        CAPTURE_UI_STATE.with(|state| {
            if let Some(ref mut s) = *state.borrow_mut() {
                s.prints.push(text.to_string());
            }
        });
    }

    fn debug(&mut self, text: &str) {
        CAPTURE_UI_STATE.with(|state| {
            if let Some(ref mut s) = *state.borrow_mut() {
                s.debugs.push(text.to_string());
            }
        });
    }

    fn print_object(&mut self, obj: &str) {
        CAPTURE_UI_STATE.with(|state| {
            if let Some(ref mut s) = *state.borrow_mut() {
                s.objects.push(obj.to_string());
            }
        });
    }

    fn print_ascii_art(&mut self, art: &str) {
        CAPTURE_UI_STATE.with(|state| {
            if let Some(ref mut s) = *state.borrow_mut() {
                s.ascii_arts.push(art.to_string());
            }
        });
    }

    fn flush(&mut self) {
        CAPTURE_UI_STATE.with(|state| {
            if let Some(ref mut s) = *state.borrow_mut() {
                s.flush_count += 1;
            }
        });
    }

    fn set_status_bar(&self, left: &str, right: &str) {
        CAPTURE_UI_STATE.with(|state| {
            if let Some(ref mut s) = *state.borrow_mut() {
                s.status_bars.push((left.to_string(), right.to_string()));
            }
        });
    }

    fn message(&self, mtype: &str, msg: &str) {
        CAPTURE_UI_STATE.with(|state| {
            if let Some(ref mut s) = *state.borrow_mut() {
                s.messages.push((mtype.to_string(), msg.to_string()));
            }
        });
    }

    fn clear(&self) {
        CAPTURE_UI_STATE.with(|state| {
            if let Some(ref mut s) = *state.borrow_mut() {
                s.clear_count += 1;
            }
        });
    }

    fn reset(&self) {
        CAPTURE_UI_STATE.with(|state| {
            if let Some(ref mut s) = *state.borrow_mut() {
                s.reset_count += 1;
            }
        });
    }

    fn get_user_input(&self) -> String {
        String::new()
    }
}
