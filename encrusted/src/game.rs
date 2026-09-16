use crate::zmachine::Zmachine;
use crate::options::Options;
use crate::traits::UI;
use std::boxed::Box;

const GAME_DATA: &[u8] = include_bytes!("../h2g2.z3");

pub struct Game;

impl Game {
    /// Seeding is the caller's business: `Options::default()` is deterministic
    /// so tests reproduce, and the wasm entry point supplies host entropy.
    pub fn load_from_ui(ui: Box<dyn UI>, opts: Options) -> Zmachine {
        let data = GAME_DATA.to_vec();

        let version = data[0];
        if version == 0 || version > 8 {
            panic!("Unsupported game version: {}", version);
        }

        Zmachine::new(data, ui, opts)
    }
}
