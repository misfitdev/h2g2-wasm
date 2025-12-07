use std::collections::{HashMap, HashSet};

#[derive(Clone, Debug, serde::Deserialize, serde::Serialize)]
pub struct HintQuestion {
    pub question: String,
    pub answers: Vec<String>,
    pub section: String,
    pub tags: Vec<String>,
}

#[derive(Clone, Debug, serde::Deserialize)]
pub struct HintSection {
    pub name: String,
    pub questions: Vec<HintQuestion>,
}

#[derive(Clone, Debug, serde::Deserialize)]
pub struct HintBook {
    pub sections: Vec<HintSection>,
}

pub struct HintSystem {
    book: HintBook,
    question_levels: HashMap<usize, usize>,
    current_question_idx: Option<usize>,
}

impl HintSystem {
    pub fn new() -> Self {
        let json_data = include_str!("../../data/invisiclues.json");
        let book: HintBook = serde_json::from_str(json_data)
            .expect("Failed to parse InvisiClues JSON");

        HintSystem {
            book,
            question_levels: HashMap::new(),
            current_question_idx: None,
        }
    }

    /// Derive state tags from game state
    /// This would be called with actual game context (current act, location, etc.)
    fn get_state_tags(context: Option<&str>) -> HashSet<String> {
        let mut tags = HashSet::new();

        if let Some(ctx) = context {
            let ctx_lower = ctx.to_lowercase();
            tags.insert(ctx_lower);
        }

        tags
    }

    /// Extract tags with a given prefix
    fn extract_tags(tags: &[String], prefix: &str) -> HashSet<String> {
        tags.iter()
            .filter(|tag| tag.starts_with(&format!("{}:", prefix)))
            .cloned()
            .collect()
    }

    /// Score a question based on overlap and specificity
    fn score_question(question: &HintQuestion, state_tags: &HashSet<String>) -> i32 {
        let q_tags: HashSet<String> = question.tags.iter().cloned().collect();

        // Calculate overlap
        let overlap = q_tags.intersection(state_tags).count() as i32;

        // Calculate specificity
        let specificity = q_tags.len() as i32;

        // Score = overlap * 10 - (specificity - overlap)
        overlap * 10 - (specificity - overlap)
    }

    /// Check if question is relevant based on hard matching rules
    fn is_relevant(question: &HintQuestion, state_tags: &HashSet<String>) -> bool {
        // Rule 1: act: tags MUST match
        let q_act_tags = Self::extract_tags(&question.tags, "act");
        if !q_act_tags.is_empty() {
            let state_act_tags = state_tags.iter()
                .filter(|tag| tag.starts_with("act:"))
                .cloned()
                .collect::<HashSet<_>>();

            if q_act_tags.is_disjoint(&state_act_tags) {
                return false;
            }
        }

        // Rule 2: loc: tags - if question has location tags, at least one must match
        let q_loc_tags = Self::extract_tags(&question.tags, "loc");
        if !q_loc_tags.is_empty() {
            let state_loc_tags = state_tags.iter()
                .filter(|tag| tag.starts_with("loc:"))
                .cloned()
                .collect::<HashSet<_>>();

            if q_loc_tags.is_disjoint(&state_loc_tags) {
                return false;
            }
        }

        true
    }

    /// Get contextual hints based on game state (act, location)
    /// Returns a sorted list of relevant questions with their scores
    pub fn get_hints_for_state(&self, context: Option<&str>) -> Vec<(usize, String, String)> {
        let state_tags = Self::get_state_tags(context);
        let all_questions = self.get_all_questions();

        let mut scored: Vec<(usize, i32, String, String)> = all_questions
            .iter()
            .enumerate()
            .filter(|(_, q)| Self::is_relevant(q, &state_tags))
            .map(|(idx, q)| {
                let score = Self::score_question(q, &state_tags);
                (idx, score, q.question.clone(), q.section.clone())
            })
            .collect();

        // Sort by descending score
        scored.sort_by(|a, b| b.1.cmp(&a.1));

        scored.into_iter()
            .map(|(idx, _, q, s)| (idx, q, s))
            .collect()
    }

    /// Get contextual hint based on location (legacy method, kept for compatibility)
    pub fn get_contextual_hint(&mut self, context: Option<&str>) -> (String, String) {
        let hints = self.get_hints_for_state(context);

        if let Some((idx, _, _)) = hints.first() {
            return self.format_question_response(*idx);
        }

        // Fallback to generic hint
        let level = *self.question_levels.get(&usize::MAX).unwrap_or(&0);
        let generic_hint = self.get_generic_hint(level);
        (
            "Here's a hint:".to_string(),
            generic_hint,
        )
    }

    fn format_question_response(&mut self, question_idx: usize) -> (String, String) {
        let questions = self.get_all_questions();
        if question_idx >= questions.len() {
            return (
                "No hint available".to_string(),
                "Sorry, I couldn't find a relevant hint for your situation.".to_string(),
            );
        }

        let question = &questions[question_idx];
        let current_level = *self.question_levels.get(&question_idx).unwrap_or(&0);

        // Determine which answer to show
        let answer_idx = if current_level >= question.answers.len() {
            question.answers.len() - 1
        } else {
            current_level
        };

        let answer = question.answers[answer_idx].clone();

        // Increment level for next time
        self.question_levels
            .insert(question_idx, current_level + 1);
        self.current_question_idx = Some(question_idx);

        (question.question.clone(), answer)
    }

    fn get_all_questions(&self) -> Vec<HintQuestion> {
        self.book
            .sections
            .iter()
            .flat_map(|section| section.questions.clone())
            .collect()
    }

    /// Get a generic hint (fallback for unknown situations)
    pub fn get_generic_hint(&self, level: usize) -> String {
        match level {
            0 => "Type 'help' for a list of commands. Use 'look' to see where you are.".to_string(),
            1 => "Try examining things around you with 'examine <object>'.".to_string(),
            2 => "Have you tried talking to people? Use 'talk to <character>'.".to_string(),
            _ => "Take your time and explore. The game has a unique sense of humor!".to_string(),
        }
    }

    /// List all available hint questions for debugging
    pub fn list_all_questions(&self) -> Vec<String> {
        self.get_all_questions()
            .iter()
            .map(|q| q.question.clone())
            .collect()
    }

    /// Get questions available for a specific location (legacy, uses simple filtering)
    pub fn get_questions_for_location(&self, location: &str) -> Vec<(usize, HintQuestion)> {
        let location_lower = location.to_lowercase();
        self.get_all_questions()
            .iter()
            .enumerate()
            .filter(|(_, q)| {
                q.tags.iter().any(|tag| tag.contains(&location_lower))
                    || q.question.to_lowercase().contains(&location_lower)
            })
            .map(|(idx, q)| (idx, q.clone()))
            .collect()
    }

    /// Get a specific answer at a given level for a question
    pub fn get_answer_at_level(&self, question_idx: usize, level: usize) -> Option<String> {
        let questions = self.get_all_questions();
        if question_idx >= questions.len() {
            return None;
        }

        let question = &questions[question_idx];
        let answer_idx = if level >= question.answers.len() {
            question.answers.len() - 1
        } else {
            level
        };

        Some(question.answers[answer_idx].clone())
    }
}

impl Default for HintSystem {
    fn default() -> Self {
        Self::new()
    }
}
