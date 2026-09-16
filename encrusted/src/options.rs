pub struct Options {
    pub rand_seed: [u32; 4],
}

impl Default for Options {
    fn default() -> Options {
        Options {
            rand_seed: [90, 111, 114, 107],
        }
    }
}
