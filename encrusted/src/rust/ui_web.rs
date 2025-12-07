use std::boxed::Box;
use std::ffi::CString;
use std::fmt::Write;
use std::os::raw::c_char;

use serde_json;

use crate::traits::UI;

extern "C" {
    fn js_message(mtype: *mut c_char, message: *mut c_char);
}

#[derive(Debug)]
enum Token {
    Newline,
    Text(String),
    Object(String),
    Debug(String),
    AsciiArt(String),
}

#[derive(Debug)]
pub struct WebUI {
    buffer: Vec<Token>,
}

impl UI for WebUI {
    fn new() -> Box<WebUI> {
        Box::new(WebUI { buffer: Vec::new() })
    }

    fn print(&mut self, text: &str) {
        if text.is_empty() {
            return;
        }

        if text == "\n" {
            self.buffer.push(Token::Newline);
            return;
        }

        // Intercept the clue book message and mark it as intercepted
        // The actual hint will be provided by the hint system
        if text.contains("complete map and InvisiClues Hint Booklet") {
            return;
        }

        if !text.contains('\n') {
            self.buffer.push(Token::Text(String::from(text)));
            return;
        }

        let lines = text.lines().collect::<Vec<_>>();

        for (index, line) in lines.iter().enumerate() {
            if !line.is_empty() {
                self.buffer.push(Token::Text(String::from(*line)));
            }

            if let Some(_) = lines.get(index + 1) {
                self.buffer.push(Token::Newline);
            }
        }

        if text.ends_with('\n') {
            self.buffer.push(Token::Newline);
        }
    }

    fn debug(&mut self, text: &str) {
        self.buffer.push(Token::Debug(String::from(text)));
    }

    fn print_object(&mut self, obj: &str) {
        self.buffer.push(Token::Object(String::from(obj)));
    }

    fn print_ascii_art(&mut self, art: &str) {
        self.buffer.push(Token::AsciiArt(String::from(art)));
    }

    fn flush(&mut self) {
        if self.buffer.is_empty() {
            return;
        }

        let mut html = String::new();

        for (index, item) in self.buffer.iter().enumerate() {
            let prev = if index == 0 {
                None
            } else {
                self.buffer.get(index - 1)
            };

            let next = self.buffer.get(index + 1);

            match *item {
                Token::Newline => {
                    html.push_str("<br>");
                }
                Token::Text(ref text) => {
                    let escaped = text.replace("&", "&amp;")
                        .replace("<", "&lt;")
                        .replace(">", "&gt;");

                    match prev {
                        Some(&Token::Text(_)) => (),
                        _ => html.push_str("<span>"),
                    }

                    html.push_str(&escaped);

                    match next {
                        Some(&Token::Text(_)) => (),
                        _ => html.push_str("</span>"),
                    }
                }
                Token::Object(ref obj) => {
                    let escaped = obj.replace("&", "&amp;")
                        .replace("<", "&lt;")
                        .replace(">", "&gt;");

                    let class = match (prev, next) {
                        (None, Some(&Token::Newline)) => "room",
                        (Some(&Token::Newline), Some(&Token::Newline)) => "room",
                        _ => "object",
                    };

                    write!(html, r#"<span class="{}">{}</span>"#, class, escaped).unwrap();
                }
                Token::Debug(ref text) => {
                    let escaped = text.replace("&", "&amp;")
                        .replace("<", "&lt;")
                        .replace(">", "&gt;");

                    write!(html, r#"<span class="debug">{}</span>"#, escaped).unwrap();
                }
                Token::AsciiArt(ref art) => {
                    let escaped = art.replace("&", "&amp;")
                        .replace("<", "&lt;")
                        .replace(">", "&gt;");
                    write!(html, r#"<pre class="ascii-art">{}</pre>"#, escaped).unwrap();
                }
            }
        }

        self.message("print", &html);
        self.buffer.clear();
    }

    fn set_status_bar(&self, left: &str, right: &str) {
        let msg = serde_json::to_string(&(left, right)).unwrap();
        self.message("header", &msg)
    }

    fn message(&self, mtype: &str, msg: &str) {
        let type_ptr = CString::new(mtype).unwrap().into_raw();
        let msg_ptr = CString::new(msg).unwrap().into_raw();

        unsafe {
            js_message(type_ptr, msg_ptr);
            let _ = CString::from_raw(type_ptr);
            let _ = CString::from_raw(msg_ptr);
        }
    }

    fn clear(&self) {}
    fn reset(&self) {}
    fn get_user_input(&self) -> String {
        unimplemented!();
    }
}
