pub struct AsciiArt;

impl AsciiArt {
    pub fn bedroom() -> &'static str {
        r#"
    ┌─────────────────────────────────┐
    │                                 │
    │    Arthur's Bedroom             │
    │                                 │
    │   [Window]                      │
    │      ▒▒▒▒▒▒▒▒                   │
    │      ▒░░░░░▒                    │
    │      ▒░░░░░▒                    │
    │      ▒▒▒▒▒▒▒▒                   │
    │                                 │
    │     ┌──────┐                    │
    │     │ Bed  │                    │
    │     │      │                    │
    │     └──────┘                    │
    │                 ┌────┐          │
    │                 │Door│          │
    │                 └────┘          │
    │                                 │
    └─────────────────────────────────┘
"#
    }

    pub fn spaceship_pod() -> &'static str {
        r#"
    ╔═════════════════════════════════╗
    ║                                 ║
    ║    Escape Pod                   ║
    ║                                 ║
    ║           ◁ ▲ ▶                 ║
    ║          ◄ ║ ►                  ║
    ║          ▽ ▼ ▽                  ║
    ║                                 ║
    ║      [Navigation Console]       ║
    ║      ┌──────────────────┐       ║
    ║      │ █ █ █ █ █ █ █   │       ║
    ║      │ ● ● ● ● ● ● ●   │       ║
    ║      └──────────────────┘       ║
    ║                                 ║
    ║      ◯ Emergency Beacon ◯       ║
    ║                                 ║
    ╚═════════════════════════════════╝
"#
    }

    pub fn heart_of_gold() -> &'static str {
        r#"
    ╭─────────────────────────────────╮
    │                                 │
    │    Heart of Gold Bridge         │
    │                                 │
    │          ╱╲╱╲╱╲╱╲              │
    │         ╱  ▓▓▓▓▓▓  ╲             │
    │        ╱   ▓ ◆ ▓   ╲            │
    │       ╱    ▓▓▓▓▓▓    ╲           │
    │      ╱      ▓▓▓▓      ╲          │
    │                                 │
    │   [Navigation]  [Viewscreen]    │
    │   ┌──────┐      ╱╲              │
    │   │  ●   │     ╱  ╲             │
    │   └──────┘    ╱    ╲            │
    │                                 │
    │   [Controls]  [Doors]           │
    │   ✦ ✦ ✦ ✦    ◠ ◡              │
    │                                 │
    ╰─────────────────────────────────╯
"#
    }

    pub fn magrathea() -> &'static str {
        r#"
    ════════════════════════════════════
    ║                                  ║
    ║    Magrathea - Planet Factory    ║
    ║                                  ║
    ║       ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲        ║
    ║      ▲           ▲▲▲           ▲ ║
    ║     ▲  ▓▓▓▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓▓▓  ▲║
    ║    ▲   ▓ Crater ▓   ▓ Crater ▓  ▲║
    ║    ▲   ▓▓▓▓▓▓▓▓▓    ▓▓▓▓▓▓▓▓▓  ▲║
    ║     ▲   ▓▓▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓▓  ▲ ║
    ║      ▲  ░░░░░░░░░░░░░░░░░░░  ▲  ║
    ║       ▲▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▲   ║
    ║                                  ║
    ║  [Machinery] ◆ [Control Room]   ║
    ║     ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬      ║
    ║                                  ║
    ════════════════════════════════════
"#
    }

    pub fn milliways_cafe() -> &'static str {
        r#"
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                               ┃
    ┃  Milliways - The Restaurant   ┃
    ┃                               ┃
    ┃   ★ The End of the Universe ★ ┃
    ┃                               ┃
    ┃    [Window to Space]          ┃
    ┃    ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆       ┃
    ┃    ◆ ◇ ◇ ◇ ◇ ◇ ◇ ◇ ◇ ◆       ┃
    ┃    ◆ ◇ ◇ ◇ ◇ ◇ ◇ ◇ ◇ ◆       ┃
    ┃    ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆       ┃
    ┃                               ┃
    ┃  ┌──────┐    ┌──────┐        ┃
    ┃  │Table │    │Table │        ┃
    ┃  └──────┘    └──────┘        ┃
    ┃                               ┃
    ┃  [Bar] ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   ┃
    ┃                               ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
"#
    }

    pub fn alien_landscape() -> &'static str {
        r#"
    ═══════════════════════════════════
               Alien Landscape
    ═══════════════════════════════════

         ◗ ~ ◗ ~ ◗ ~ ◗ ~ ◗ ~ ◗
        ~ ◗ ~ ◗ ~ ◗ ~ ◗ ~ ◗ ~ ◗
       ◗ ~ ◗ ~ ◗ ~ ◗ ~ ◗ ~ ◗ ~ ◗

         ▲▲▲         ▲▲▲
        ▲▓▓▓▲       ▲▓▓▓▲
       ▲▓▓▓▓▓▲     ▲▓▓▓▓▓▲
       ▓▓▓▓▓▓▓▓ ▓ ▓▓▓▓▓▓▓▓

      ░░░░░░░░░░░░░░░░░░░░░░░
      ░░░░░░░░░░░░░░░░░░░░░░░
      ░░░░░░░░░░░░░░░░░░░░░░░

    Two suns overhead
       ◯  ◯
        Sun ◯
           Sun

    ═══════════════════════════════════
"#
    }

    pub fn get_art(location: &str) -> Option<&'static str> {
        match location {
            "bedroom" => Some(Self::bedroom()),
            "pod" | "spaceship_pod" | "escape_pod" => Some(Self::spaceship_pod()),
            "heart_of_gold" | "bridge" => Some(Self::heart_of_gold()),
            "magrathea" => Some(Self::magrathea()),
            "cafe" | "milliways" => Some(Self::milliways_cafe()),
            "landscape" | "alien" => Some(Self::alien_landscape()),
            _ => None,
        }
    }
}
