# Daily Life Gamification

_Started 2026-04-23 13:59 UTC_

---

## User

I want to create a daily life improvement app with gamification effects. Mobile first approach.
It should be a modular app.
On homepage there should be different icons (life improvement cartegories)
like daily routines, education, workout, notes/tasks.. 
Each item should have some check/finished mechanism which would increase XP or get point for the user in specified category,
eg completing the workout will increase fitness lvl, completing education task will increase intellect, and so on.

## Assistant

I'll design a gamified daily life improvement app for you. Before I start building, let me ask a few focused questions to make sure I build the right thing.

_[tool: questions_v2]_

## User

Questions answered:
- visual_direction: Playful & colorful (think Duolingo energy)
- categories: Daily routines / habits, Workout / fitness, Education / learning, Notes & tasks, Nutrition / diet, Meditation / mindfulness, Sleep tracking, Reading, Social / relationships, Finance, Creativity / hobbies, Career / work
- stat_system: Overall XP + skill tree branches
- gamification: Daily quests / bounties, Achievements & badges, Heatmap calendar, Weekly boss / big goal, Streaks with fire counter
- screens: Home dashboard, Category detail (e.g. Workout page), Add/check-off task flow, Stats / profile page, Achievements gallery, Weekly recap
- variations: Just one — pick the best
- interactivity: Hi-fi static screens only
- device_frame: Bare screen (no frame)
- tone: Deadpan / witty
- tweaks_focus: Card layout variants, Stat system variants, Theme / color variants, Icon style (line vs filled vs emoji)

## Assistant

Great, I have what I need. Let me plan this out.

_[tool: update_todos]_

_[tool: copy_starter_component]_

_[tool: read_file]_

_[tool: snip]_

Now let me build the app. I'll define a bold visual system (Duolingo-energy: saturated but not garish, chunky, friendly) and build 6 screens.

**Visual system:**
- **Type:** Nunito (round, friendly) + JetBrains Mono (for XP numbers, deadpan stat readouts)
- **Palette:** Cream bg `#FFF8EC`, ink `#1F1A14`, primary violet `#7C5CFF`, XP green `#2AD17A`, fire orange `#FF7A3D`, coin yellow `#FFC83D`, soft shadows with chunky 3-4px "stack" borders for that tactile game-UI feel
- **Density:** Airy, chunky cards with offset drop-shadows (no blurs), 20px radii
- **Copy tone:** Deadpan — "Did 12 pushups. Your skeleton sighed approvingly."

Let me build it.

_[tool: write_file]_

_[tool: write_file]_

Now let me build the shared UI primitives and each screen.

_[tool: write_file]_

Now the home dashboard — the hero screen.

_[tool: write_file]_

_[tool: snip]_

Now the Category Detail (Workout) screen.

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: done]_

_[tool: snip]_

_[tool: fork_verifier_agent]_

**Dnevnik** — 6 screens on a design canvas:

- **Home dashboard** — XP hero card, today's quests, weekly boss, 12-category skill grid
- **Category detail (Fitness)** — Level header, streak stats, today's workout list, 12-week heatmap, branch trophies
- **Add/check-off flow** — Quest name, branch picker, difficulty tiers (+XP preview), repeat days, reward preview
- **Stats / Profile** — Avatar, total XP, skill tree ranked by level, lifetime totals
- **Trophy Room** — Filter chips, featured latest, 3-col grid with locked/legendary states
- **Weekly Recap** — Purple hero, XP by branch bar chart, highlights, next week's boss

Visual system: Nunito + JetBrains Mono, cream/ink with 8 category hues, chunky 2.5px borders + 3-4px offset shadows. Deadpan copy throughout ("The Moderately Swole", "Eat one (1) vegetable"). Click any artboard to focus it fullscreen.

## User

add quests page

## Assistant

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: done]_

Added **Quests** page as screen 02, now sitting between Home and Fitness. It shows a summary strip (Daily 2/5, Weekly 1/3, Epic 0/1), filter tabs, and three grouped sections — Daily (resets at midnight), Weekly (3d left), and Epic (long-running) — each quest row has a check, branch icon, progress bar or timer, and XP reward.

_[tool: fork_verifier_agent]_

<NO_RESPONSE/>

## User

Save as standalone HTML: Dnevnik.html

## Assistant

## Assistant

