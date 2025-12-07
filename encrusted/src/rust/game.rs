use crate::zmachine::Zmachine;
use crate::options::Options;
use crate::traits::UI;
use std::boxed::Box;

const GAME_DATA: &[u8] = include_bytes!("../../h2g2.z3");

pub struct Game;

impl Game {
    pub fn load_from_ui(ui: Box<dyn UI>, mut opts: Options) -> Zmachine {
        let data = GAME_DATA.to_vec();

        let version = data[0];
        if version == 0 || version > 8 {
            panic!("Unsupported game version: {}", version);
        }

        // Use a fixed seed for consistency (WASM can't use rand::random() reliably)
        // The Z-machine will call js_rand for runtime randomness
        opts.rand_seed = [0xDEADBEEF, 0xCAFEBABE, 0x12345678, 0x87654321];

        Zmachine::new(data, ui, opts)
    }
}
