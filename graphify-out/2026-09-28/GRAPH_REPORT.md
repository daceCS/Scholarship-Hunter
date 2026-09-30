# Graph Report - Scholarship Hunter  (2026-09-28)

## Corpus Check
- 229 files · ~433,502 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 39 file(s) not represented in the graph (top: .toml 18, .log 10, (none) 7)

## Summary
- 1259 nodes · 1777 edges · 116 communities (98 shown, 18 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 166 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `35144c0c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- questionnaire/app.js
- simplify-ignore.sh
- slug.test.js
- run-evals.js
- design-taste-frontend skill (anti-slop frontend)
- using-agent-skills meta-skill
- Grantly landing page snapshot
- idea-refine skill
- deprecation-and-migration skill
- image-to-code skill
- Getting Started with agent-skills
- Lifecycle slash commands (/spec /plan /build /test /review /ship)
- skill-lint-test.js
- validate-commands-test.js
- code-review-and-quality skill
- floor-guard-reference-test.js
- Questionnaire Intro Screen
- code-reviewer persona
- /ship command
- Incident pressure scenario
- skill-lint.js
- validate-artifact-paths-test.js
- validate-reference-links-test.js
- Grantly landing page full-page desktop preview
- graphify skill (/graphify pipeline)
- Gemini CLI setup
- validate-commands.js
- History Summary Screen (mobile, profile ready)
- agent-skills pack
- constraint-driven-development skill
- validate-reference-links.js
- frontend-ui-engineering skill
- Primary green Get Started and outlined secondary account button pair
- apply_entries
- simplify-ignore-test.sh
- check.mjs
- /build command
- benchmark.js
- ci-cd-and-automation skill
- validate-artifact-paths.js
- context-engineering skill
- marketplace.json
- Bug report FIN-482: cents lost on three-way splits
- sdd-cache-test.sh
- validate-skills.js
- validate-skills job (skill validators and evals)
- test-driven-development/package.json
- properties
- selftest.mjs
- ci-cd-and-automation/package.json
- validate-versions.js
- code-simplification skill
- mock.js
- web-performance-auditor persona
- sdd-cache-post.sh
- properties
- CONTRIBUTING.md
- sdd-cache-pre.sh
- Button.tsx
- Scholarship Hunter — Backend System Plan
- Signup form page
- v1 API inventory
- Notifications specification
- Usage-based billing brief
- session-start.sh
- session-start-test.sh
- idea-refine.sh
- Airbnb homepage snapshot
- prune
- URL shortener service brief
- Session context audit
- Orders architecture decision context
- Menu component conventions
- Express session implementation task
- Login regression report
- effort
- start
- properties
- config-parser.test.js
- ref_node_assert
- ref_node_test
- reports.test.js
- webhook.test.js
- split.test.js
- properties
- items
- geo_scope
- Test set 1: 300 hand-labeled scholarship pages
- field
- emil-design-eng skill (Emil Kowalski design engineering)
- Layout discipline hard rules (hero, eyebrow, zigzag, bento)
- scholarship.schema.json
- imagegen-frontend-mobile skill
- Mercury social proof (logo wall, testimonials, stats strip)
- test-sets/package.json
- contract/package.json
- brandkit skill
- AI tells (forbidden patterns incl. em-dash ban)
- interview-me skill
- debugging-and-error-recovery skill
- Contract (Phase 0)
- confidence
- Scholarship Hunter Step 1 Intake Spec
- source_url
- deadline_kind
- Orchestration Patterns
- name
- Test-set tooling
- provider_org
- type
- service_obligation
- apply_url
- verified_at
- need_based

## God Nodes (most connected - your core abstractions)
1. `agent-skills pack` - 61 edges
2. `h()` - 25 edges
3. `Getting Started with agent-skills` - 15 edges
4. `scoreRun()` - 14 edges
5. `Scholarship Hunter — Backend System Plan` - 14 edges
6. `Lifecycle slash commands (/spec /plan /build /test /review /ship)` - 14 edges
7. `design-taste-frontend skill (anti-slop frontend)` - 14 edges
8. `Skill Anatomy` - 12 edges
9. `readManifest()` - 11 edges
10. `Orchestration Patterns` - 11 edges

## Surprising Connections (you probably didn't know these)
- `11. Funnel, accounts and payments` --references--> `submitAvatar()`  [INFERRED]
  backend-plan.md → questionnaire/api.js
- `9. Build order` --references--> `submitAvatar()`  [INFERRED]
  backend-plan.md → questionnaire/api.js
- `Pill-shaped segmented search bar (Where/When/Who)` --semantically_similar_to--> `Hero: Scholarships that fit you, not everyone`  [INFERRED] [semantically similar]
  inspiration/travel-airbnb.png → landing/preview-desktop.png
- `Three-phase gated questionnaire (Core, Branch, ...)` --semantically_similar_to--> `Gated workflow Specify-Plan-Tasks-Implement`  [INFERRED] [semantically similar]
  intake-questionnaire.md → agent-skills/skills/spec-driven-development/SKILL.md
- `view()` --indirect_call--> `total()`  [INFERRED]
  dashboard/app.js → agent-skills/evals/fixtures/git-workflow-and-versioning/app.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Agent skills routed by the meta-skill across the lifecycle** — agent_skills_skills_using_agent_skills_skill, agent_skills_skills_spec_driven_development_skill, agent_skills_skills_planning_and_task_breakdown_skill, agent_skills_skills_test_driven_development_skill, agent_skills_skills_shipping_and_launch_skill [EXTRACTED 1.00]
- **Endorsed orchestration patterns** — agent_skills_references_orchestration_patterns_direct_invocation, agent_skills_references_orchestration_patterns_single_persona_command, agent_skills_references_orchestration_patterns_parallel_fan_out, agent_skills_references_orchestration_patterns_sequential_pipeline, agent_skills_references_orchestration_patterns_research_isolation [EXTRACTED 1.00]
- **Pressure-case eval fixtures (time, sunk cost, authority)** — agent_skills_evals_fixtures_debugging_and_error_recovery_time_pressure, agent_skills_evals_fixtures_incremental_implementation_pressure_scenario, agent_skills_evals_fixtures_shipping_and_launch_authority_pressure [EXTRACTED 1.00]
- **code-review-fires eval case (prompt + graders)** — agent_skills_evals_plugin_code_review_fires_prompt, agent_skills_evals_plugin_code_review_fires_graders_off_by_one, agent_skills_evals_plugin_code_review_fires_graders_severity_labels, agent_skills_evals_plugin_code_review_fires_graders_skill_fired [EXTRACTED 1.00]
- **graphify skill and its reference documents** — _claude_skills_graphify_skill, _claude_skills_graphify_references_add_watch, _claude_skills_graphify_references_exports, _claude_skills_graphify_references_extraction_spec, _claude_skills_graphify_references_github_and_merge, _claude_skills_graphify_references_hooks, _claude_skills_graphify_references_query, _claude_skills_graphify_references_transcribe, _claude_skills_graphify_references_update [EXTRACTED 1.00]
- **/ship parallel persona fan-out** — agent_skills_agents_code_reviewer, agent_skills_agents_security_auditor, agent_skills_agents_test_engineer [EXTRACTED 1.00]
- **Per-tool setup guides for agent-skills** — agent_skills_docs_antigravity_setup_antigravity_setup, agent_skills_docs_codex_setup_codex_setup, agent_skills_docs_commandcode_setup_commandcode_setup, agent_skills_docs_copilot_cli_setup_copilot_cli_setup, agent_skills_docs_copilot_setup_copilot_setup, agent_skills_docs_cursor_setup_cursor_setup, agent_skills_docs_gemini_cli_setup_gemini_cli_setup [EXTRACTED 1.00]
- **Reference landing page snapshots (Duolingo, Mercury, Oura, Linear)** — _playwright_mcp_page_2026_09_29t02_43_23_151z, _playwright_mcp_page_2026_09_29t02_43_28_865z, _playwright_mcp_page_2026_09_29t02_43_35_712z, _playwright_mcp_page_2026_09_29t02_43_43_161z [INFERRED 0.75]
- **Automated quality bar enforcement** — agent_skills_skills_constraint_driven_development_skill_constraints_md, agent_skills_skills_constraint_driven_development_references_floor_guard_floor_guard_mjs, agent_skills_skills_ci_cd_and_automation_skill_quality_gate_pipeline, agent_skills_skills_code_review_and_quality_skill_five_axis_review [INFERRED 0.75]
- **Agent-skills lifecycle slash commands (spec, plan, build, test, review, ship)** — agent_skills_claude_commands_spec, agent_skills_claude_commands_plan, agent_skills_claude_commands_build, agent_skills_claude_commands_test, agent_skills_claude_commands_review, agent_skills_claude_commands_ship [INFERRED 0.85]
- **Agent-skills reference checklists** — agent_skills_references_accessibility_checklist, agent_skills_references_definition_of_done, agent_skills_references_observability_checklist, agent_skills_references_performance_checklist [INFERRED 0.85]
- **Agent tool setup guides** — agent_skills_docs_getting_started, agent_skills_docs_opencode_setup, agent_skills_docs_windsurf_setup [INFERRED 0.85]
- **Contributor validation flow (contributing, onboarding, CI)** — agent_skills_contributing_contributing_guide, agent_skills_docs_developer_onboarding_verification_loop, agent_skills_github_workflows_test_plugin_install_ci_workflow [INFERRED 0.85]
- **Frontend design and image-direction skill family** — _agents_skills_design_taste_frontend_skill, _agents_skills_gpt_taste_skill, _agents_skills_image_to_code_skill, _agents_skills_imagegen_frontend_web_skill, _agents_skills_imagegen_frontend_mobile_skill, _agents_skills_brandkit_skill [INFERRED 0.85]
- **Landing page sections across previews** — landing_preview_desktop_hero, landing_preview_desktop_how_it_works, landing_preview_desktop_interactive_demo, landing_preview_hero_bento_grid, landing_preview_pricing_plans, landing_preview_desktop_faq_cta [INFERRED 0.85]
- **Landing page evolution: Grantly to Tuitionwing with pricing iterations** — playwright_mcp_page_2026_09_29t02_45_53_211z_grantly_landing, playwright_mcp_page_2026_09_29t02_55_13_374z_tuitionwing_landing_free, playwright_mcp_page_2026_09_29t02_56_35_013z_tuitionwing_landing_freemium, playwright_mcp_page_2026_09_29t02_57_42_785z_tuitionwing_landing_trial [INFERRED 0.85]
- **Landing page hero design inspirations** — inspiration_devtools_linear, inspiration_education_duolingo, inspiration_fintech_mercury, inspiration_health_oura [INFERRED 0.85]
- **Tuitionwing questionnaire flow: intro to questions to results to summary** — playwright_mcp_page_2026_09_29t03_13_43_404z_intro_screen, playwright_mcp_page_2026_09_29t03_14_09_799z_school_question_screen, playwright_mcp_page_2026_09_29t03_14_25_540z_core_results_screen, playwright_mcp_page_2026_09_29t03_14_57_093z_profile_summary_screen [INFERRED 0.85]
- **Scholarship Hunter questionnaire mobile UI screens** — playwright_mcp_page_2026_09_29t03_15_10_020z_history_summary_screen, playwright_mcp_page_2026_09_29t03_15_21_629z_history_summary_screen, playwright_mcp_page_2026_09_29t03_15_43_584z_core_academic_screen [INFERRED 0.85]
- **Questionnaire screens: intro, stage question, profile summary** — playwright_mcp_page_2026_09_29t03_13_43_010z_questionnaire_intro, playwright_mcp_page_2026_09_29t03_13_52_928z_questionnaire_stage_question, playwright_mcp_page_2026_09_29t03_15_07_963z_profile_summary [INFERRED 0.85]
- **Small verified incremental change discipline** — agent_skills_skills_incremental_implementation_skill_increment_cycle, agent_skills_skills_git_workflow_and_versioning_skill_atomic_commits, agent_skills_skills_git_workflow_and_versioning_skill_save_point_pattern, agent_skills_skills_code_review_and_quality_skill_change_sizing [INFERRED 0.85]
- **Tuitionwing landing to questionnaire intake flow** — landing_index, questionnaire_index, intake_questionnaire [INFERRED 0.85]
- **Treat external content as untrusted data** — agent_skills_skills_browser_testing_with_devtools_skill_untrusted_browser_content, agent_skills_skills_debugging_and_error_recovery_skill_untrusted_error_output, agent_skills_skills_api_and_interface_design_skill_validate_at_boundaries, agent_skills_references_security_checklist_owasp_llm_top_10 [INFERRED 0.85]

## Communities (116 total, 18 thin omitted)

### Community 0 - "questionnaire/app.js"
Cohesion: 0.09
Nodes (45): afterChange(), buildBlock(), buildRow(), combo(), close(), find(), open(), pick() (+37 more)

### Community 1 - "simplify-ignore.sh"
Cohesion: 0.06
Nodes (41): off-by-one grader (LLM), severity-labels grader (regex), skill-fired grader (tool_used), code-review-fires eval prompt, pageOrders off-by-one diff, not-fired grader (commit message case), code-review-stays-quiet-on-commit-message eval prompt, Rejected Skill Changes ledger (+33 more)

### Community 2 - "slug.test.js"
Cohesion: 0.40
Nodes (4): slugify(), assert, { slugify }, test

### Community 3 - "run-evals.js"
Cohesion: 0.07
Nodes (41): buildCorpus(), CASES_DIR, clearGradingSlot(), cosine(), EVAL_KINDS, { execFileSync }, extractExecutorModel(), FIXTURES_DIR (+33 more)

### Community 4 - "design-taste-frontend skill (anti-slop frontend)"
Cohesion: 0.21
Nodes (12): Brand color discipline (one dominant palette), Brief inference and Design Read, Color calibration (one accent, palette bans, lock rules), Dark mode protocol (dual-mode, token strategy), Default stack (React/Next, Tailwind v4, Motion), Brief to design system map (official packages), Apple Liquid Glass web approximation, Redesign protocol (preserve vs overhaul) (+4 more)

### Community 5 - "using-agent-skills meta-skill"
Cohesion: 0.10
Nodes (25): observability-and-instrumentation skill, Structured logging with correlation IDs, performance-optimization skill, Core Web Vitals targets (LCP, INP, CLS), Measure-first optimization workflow, planning-and-task-breakdown skill, Vertical slicing of tasks, Hardening patterns reference (+17 more)

### Community 6 - "Grantly landing page snapshot"
Cohesion: 0.08
Nodes (31): Free vs Premium comparison pattern, Rocket Money landing page snapshot, Rocket Money 5-star testimonials section, Landing page mini demo questionnaire with live award count, Effort budget (min award and weekly hours), Landing page FAQ section, Grantly brand name, Grantly landing page snapshot (+23 more)

### Community 7 - "idea-refine skill"
Cohesion: 0.10
Nodes (23): Prefer Clarity Over Cleverness, Doubt cycle (claim, extract, doubt, reconcile, stop), Ideation session examples, Real-time collaboration example, ReOrder restaurant regulars example, Team retrospective example, Ideation frameworks reference, Constraint-Based Ideation (+15 more)

### Community 8 - "deprecation-and-migration skill"
Cohesion: 0.13
Nodes (20): api-and-interface-design skill, Consistent Error Semantics, Contract First design, Hyrum's Law, Honouring an Idempotency Key, One-Version Rule, Feature Flags, deprecation-and-migration skill (+12 more)

### Community 9 - "image-to-code skill"
Cohesion: 0.21
Nodes (13): Image and visual asset strategy, Anti-drift implementation rule (copy-oriented), Anti-nested-box and micro-UI clutter rules, Image-first workflow (generate, analyze, implement), Do not crop old images, regenerate fresh, One large image per section rule, image-to-code skill, Multi-image continuity and palette discipline (+5 more)

### Community 10 - "Getting Started with agent-skills"
Cohesion: 0.15
Nodes (14): Getting Started with agent-skills, Agent personas (code-reviewer, test-engineer, security-auditor), Context-aware skill loading, Full lifecycle skill sequence, Shared references checklists, Skills as step-by-step workflows, Claude Code slash commands (/spec /plan /build /review /ship), SPEC.md and tasks plan artifacts (+6 more)

### Community 11 - "Lifecycle slash commands (/spec /plan /build /test /review /ship)"
Cohesion: 0.18
Nodes (13): Adoption Guide, Brownfield path (incremental, verification-first), Characterization tests before refactor, Greenfield path (full lifecycle from day one), Command Code setup, Copilot prompt-file aliases (.github/prompts), /build auto, context-engineering skill (+5 more)

### Community 12 - "skill-lint-test.js"
Cohesion: 0.13
Nodes (11): assert, FENCE_KNOWN, fmLines(), fs, KNOWN, { lintSkillContent, lintSkillLayout }, os, path (+3 more)

### Community 13 - "validate-commands-test.js"
Cohesion: 0.16
Nodes (13): { afterEach, test }, assert, fs, os, path, sandboxes, SKILL_LINT, { spawnSync } (+5 more)

### Community 14 - "code-review-and-quality skill"
Cohesion: 0.16
Nodes (15): Security Checklist, Destructive Path Operations containment, Install-Script Gate, OWASP Top 10 for LLMs, OWASP Top 10 Quick Reference, Supply-chain hygiene, Threat Modeling (STRIDE), Validate at Boundaries (+7 more)

### Community 15 - "floor-guard-reference-test.js"
Cohesion: 0.14
Nodes (12): { after, before, test }, assert, cases, CONSTRAINTS, fs, git(), makeRepo(), os (+4 more)

### Community 16 - "Questionnaire Intro Screen"
Cohesion: 0.19
Nodes (14): Saved as you go (autosave), Effort budget (min award, hours per week, max essay words), Live Profile Sidebar (dark card with answer chips and award count), Questionnaire Intro Screen, Core Academic School Question Screen, Core First Results Screen, History Profile Summary Screen, Preview Scholarship Match Cards (STEM Pathways, County Merit, etc.) (+6 more)

### Community 17 - "code-reviewer persona"
Cohesion: 0.15
Nodes (15): Agent personas, code-reviewer persona, Five-axis review framework, Review severity labels (Critical/Required/Optional/Nit), security-auditor persona, OWASP Top 10 and LLM Top 10 baseline, STRIDE trust-boundary reasoning, test-engineer persona (+7 more)

### Community 18 - "/ship command"
Cohesion: 0.20
Nodes (10): /code-simplify command, /review command, Five-axis review (correctness, readability, architecture, security, performance), /ship command, Parallel fan-out to code-reviewer, security-auditor, test-engineer personas, Go/no-go ship decision with rollback plan, /webperf command, Web perf audit Quick vs Deep modes (+2 more)

### Community 19 - "Incident pressure scenario"
Cohesion: 0.18
Nodes (11): Incident pressure scenario, Sunk-cost scenario, CSV export plan, Payment retry operations, Executive request (authority pressure), Checkout launch status, Tier 3 behavioral eval via headless claude, Eval case JSON format (+3 more)

### Community 20 - "skill-lint.js"
Cohesion: 0.21
Nodes (12): DESCRIPTION_TRIGGER_NEGATE_ALL, extractSkillReferences(), frontmatterYamlErrors(), fs, isEffectivelyEmpty(), lintSkillContent(), lintSkillLayout(), parseFrontmatter() (+4 more)

### Community 21 - "validate-artifact-paths-test.js"
Cohesion: 0.15
Nodes (9): { afterEach, test }, assert, fs, os, path, sandboxes, { spawnSync }, VALIDATOR (+1 more)

### Community 22 - "validate-reference-links-test.js"
Cohesion: 0.15
Nodes (9): { afterEach, test }, assert, fs, os, path, sandboxes, { spawnSync }, VALIDATOR (+1 more)

### Community 23 - "Grantly landing page full-page desktop preview"
Cohesion: 0.18
Nodes (13): Airbnb homepage screenshot (design inspiration), Horizontal image-card carousels with rounded tiles, Pill-shaped segmented search bar (Where/When/Who), Brand name (Grantly vs Tuitionwing), Grantly landing page full-page desktop preview, FAQ accordion and final email CTA, Hero: Scholarships that fit you, not everyone, How it works three-step section (+5 more)

### Community 24 - "graphify skill (/graphify pipeline)"
Cohesion: 0.26
Nodes (12): .claude/CLAUDE.md graphify trigger registration, graphify reference: add URL and watch, graphify reference: exports and benchmark, graphify reference: extraction subagent spec, graphify reference: GitHub clone and cross-repo merge, graphify reference: commit hook and CLAUDE.md integration, graphify reference: query, path, explain, graphify reference: transcribe video and audio (+4 more)

### Community 25 - "Gemini CLI setup"
Cohesion: 0.17
Nodes (12): Claude Code context, allowed-tools, disallowed-tools fields, Gemini subagent definitions (.gemini/agents), Per-agent configuration guide, Portable SKILL.md frontmatter principle, Antigravity CLI setup, Antigravity converted command wrappers not discoverable, Gemini CLI setup, GEMINI.md persistent context (+4 more)

### Community 26 - "validate-commands.js"
Cohesion: 0.21
Nodes (11): descriptionFromMd(), descriptionFromToml(), DIRS, { frontmatterYamlErrors }, fs, loadCommands(), main(), NAME_MAP (+3 more)

### Community 27 - "History Summary Screen (mobile, profile ready)"
Cohesion: 0.18
Nodes (12): Live awards-count pill (152 awards), Profile / JSON view toggle, Questionnaire progress tabs (Core, Branch, Sensitive, History), Radio card option list with yellow selected state, Hero with bold headline, black pill CTA, phone mockup, Send to the search agent CTA, Service-commitment awards callout (SMART, CyberCorps SFS, NHSC), Yellow pill primary button with outlined Back button (+4 more)

### Community 28 - "agent-skills pack"
Cohesion: 0.17
Nodes (15): session-start hook and regression test, .codex-plugin/plugin.json manifest, Codex setup, How agent-skills compares, Grilling loop (grill-me), Matt Pocock's skills, Do not run two meta-skill routers at once, Superpowers (obra) (+7 more)

### Community 29 - "constraint-driven-development skill"
Cohesion: 0.22
Nodes (11): Test Anti-Patterns, Review severity labels, Floor guard reference implementation, Guard exit code contract (0/1/2), floor-guard.mjs script, constraint-driven-development skill, CONSTRAINTS.md written contract, Constraint Floor (+3 more)

### Community 30 - "validate-reference-links.js"
Cohesion: 0.25
Nodes (10): stripFencedCodeBlocks(), findViolations(), fs, main(), path, ROOT, skillReferenceFiles(), SKILLS_DIR (+2 more)

### Community 31 - "frontend-ui-engineering skill"
Cohesion: 0.20
Nodes (11): browser-testing-with-devtools skill, Chrome DevTools MCP, DevTools Debugging Workflow, Profile Isolation, Triage Checklist (reproduce, localize, reduce, fix, guard, verify), frontend-ui-engineering skill, Avoid the AI Aesthetic, Composition over configuration (+3 more)

### Community 32 - "Primary green Get Started and outlined secondary account button pair"
Cohesion: 0.18
Nodes (11): Linear homepage screenshot, Dark minimal hero with large bold headline and product UI preview, Pill-shaped white Sign up button in top nav, Duolingo landing page screenshot, Playful character illustration hero with centered headline and chunky green CTA, Primary green Get Started and outlined secondary account button pair, Mercury banking homepage screenshot, Inline email input with blue Open account button and demo link (+3 more)

### Community 33 - "apply_entries"
Cohesion: 0.29
Nodes (5): apply_entries(), Simple in-memory ledger utilities., Apply entries to a starting balance and return the result. Entries are (kind,…, ApplyEntriesTest, unittest

### Community 34 - "simplify-ignore-test.sh"
Cohesion: 0.33
Nodes (8): assert_eq(), block_hash(), CACHE, file_id(), hash_cmd(), hook_event(), rt_hook_event(), simplify-ignore-test.sh script

### Community 35 - "check.mjs"
Cohesion: 0.09
Nodes (20): ajv, allV, base, byPath, ctx, enumBad, eq(), err() (+12 more)

### Community 36 - "/build command"
Cohesion: 0.25
Nodes (9): /build command, /build auto autonomous mode (single approval checkpoint), /plan command, tasks/plan.md and tasks/todo.md artifacts, /spec command, SPEC.md specification artifact, Test-driven development loop (RED, GREEN, refactor), /test command (+1 more)

### Community 37 - "benchmark.js"
Cohesion: 0.25
Nodes (7): output, { performance }, products, { renderProducts }, start, renderProducts(), ref_node_perf_hooks

### Community 38 - "ci-cd-and-automation skill"
Cohesion: 0.22
Nodes (9): Testing Patterns Reference (JS/TS), Arrange-Act-Assert, Mock at Boundaries Only, Playwright E2E testing, ci-cd-and-automation skill, Quality Gate Pipeline, Shift Left, Staged Rollouts and Rollback Plan (+1 more)

### Community 39 - "validate-artifact-paths.js"
Cohesion: 0.25
Nodes (8): ARTIFACT_ALLOWLIST, findViolations(), fs, GUARDED_FILES, main(), path, ROOT, ref_fs

### Community 40 - "context-engineering skill"
Cohesion: 0.25
Nodes (9): Treat browser content as untrusted data, context-engineering skill, Context Budget Management, Context Hierarchy, Restartable Session Boundaries, Rules files (CLAUDE.md), documentation-and-adrs skill, Architecture Decision Record (ADR) (+1 more)

### Community 41 - "marketplace.json"
Cohesion: 0.25
Nodes (7): description, name, owner, name, url, plugins, $schema

### Community 42 - "Bug report FIN-482: cents lost on three-way splits"
Cohesion: 0.29
Nodes (8): Bug report FIN-482: cents lost on three-way splits, Ledger README (Python utilities), split-payment README, Exactness and Fairness invariants, splitCents(totalCents, n), not-fired grader (TDD case), tdd-fired grader, code-review-stays-quiet eval prompt

### Community 43 - "sdd-cache-test.sh"
Cohesion: 0.39
Nodes (5): assert_eq(), hash_key(), run_hook(), seed_entry(), sdd-cache-test.sh script

### Community 44 - "validate-skills.js"
Cohesion: 0.29
Nodes (7): lintSkill(), fs, { lintSkill }, main(), path, SKILLS_DIR, ref_path

### Community 45 - "validate-skills job (skill validators and evals)"
Cohesion: 0.40
Nodes (6): Contributor verification loop (Tier 1, Tier 2, Tier 3), Test Plugin Installation CI workflow, test-install job (claude plugin install), validate-commands job, validate-skills job (skill validators and evals), Three-tier eval framework

### Community 46 - "test-driven-development/package.json"
Cohesion: 0.29
Nodes (6): description, name, private, scripts, test, version

### Community 47 - "properties"
Cohesion: 0.13
Nodes (15): additionalProperties, properties, required, type, minimum, type, minimum, type (+7 more)

### Community 48 - "selftest.mjs"
Cohesion: 0.08
Nodes (62): fs, http, path, allRules(), checkRules(), contractPath(), here, loadScholarshipSchema() (+54 more)

### Community 49 - "ci-cd-and-automation/package.json"
Cohesion: 0.33
Nodes (5): name, private, scripts, lint, test

### Community 50 - "validate-versions.js"
Cohesion: 0.40
Nodes (3): expectedVersion, manifestPaths, { readFileSync }

### Community 51 - "code-simplification skill"
Cohesion: 0.33
Nodes (6): Dead Code Hygiene, code-simplification skill, Chesterton's Fence, Preserve Behavior Exactly, Rule of 500, Zombie Code

### Community 52 - "mock.js"
Cohesion: 0.53
Nodes (4): contribution(), estimate(), fnv(), serviceBucket()

### Community 53 - "web-performance-auditor persona"
Cohesion: 0.50
Nodes (5): web-performance-auditor persona, Chrome DevTools MCP, Core Web Vitals (LCP, INP, CLS), Metric-Honesty Rule, Quick and Deep audit modes

### Community 54 - "sdd-cache-post.sh"
Cohesion: 0.70
Nodes (4): dbg(), extract_header(), hash_key(), sdd-cache-post.sh script

### Community 55 - "properties"
Cohesion: 0.14
Nodes (14): description, type, description, enum, enum, description, kind, op (+6 more)

### Community 56 - "CONTRIBUTING.md"
Cohesion: 0.11
Nodes (22): Intent to skill mapping, Implicit lifecycle mapping (DEFINE, PLAN, BUILD, VERIFY, REVIEW, SHIP), OpenCode skill-driven execution model, AGENTS.md (repo-scoped agent config), /constraints command, CONSTRAINTS.md quality bar file, Project structure (skills, agents, hooks, commands, references, evals, docs), CLAUDE.md (repo-scoped Claude config) (+14 more)

### Community 57 - "sdd-cache-pre.sh"
Cohesion: 0.83
Nodes (3): dbg(), hash_key(), sdd-cache-pre.sh script

### Community 59 - "Scholarship Hunter — Backend System Plan"
Cohesion: 0.10
Nodes (18): 10. Open decisions, 11. Funnel, accounts and payments, 12. Budget: $30/month until there are users, 13. Cost per user (estimated 2026-09-28), 1. Design principles, 2. System overview, 3. Data model, 4. Ingestion pipeline (+10 more)

### Community 77 - "effort"
Cohesion: 0.10
Nodes (20): additionalProperties, description, properties, type, description, minimum, type, items (+12 more)

### Community 78 - "start"
Cohesion: 0.42
Nodes (8): effective(), firstRun(), h(), loadState(), nextDue(), start(), render(), view()

### Community 79 - "properties"
Cohesion: 0.10
Nodes (20): type, enum, description, pattern, type, minimum, type, default (+12 more)

### Community 80 - "config-parser.test.js"
Cohesion: 0.40
Nodes (4): parseConfig(), assert, { parseConfig }, test

### Community 81 - "ref_node_assert"
Cohesion: 0.17
Nodes (9): paginate(), assert, { paginate }, test, assert, manifestPaths, { readFileSync }, test (+1 more)

### Community 82 - "ref_node_test"
Cohesion: 0.33
Nodes (5): assert, test, { total }, total(), ref_node_test

### Community 83 - "reports.test.js"
Cohesion: 0.40
Nodes (4): assert, test, { visibleReports }, visibleReports()

### Community 84 - "webhook.test.js"
Cohesion: 0.40
Nodes (4): previewWebhook(), assert, { previewWebhook }, test

### Community 85 - "split.test.js"
Cohesion: 0.40
Nodes (4): splitCents(), assert, { splitCents }, test

### Community 86 - "properties"
Cohesion: 0.06
Nodes (35): additionalProperties, description, items, type, description, type, type, pattern (+27 more)

### Community 87 - "items"
Cohesion: 0.14
Nodes (16): items, minItems, type, description, items, type, additionalProperties, properties (+8 more)

### Community 88 - "geo_scope"
Cohesion: 0.20
Nodes (10): additionalProperties, description, properties, required, type, enum, geo_scope, level (+2 more)

### Community 89 - "Test set 1: 300 hand-labeled scholarship pages"
Cohesion: 0.18
Nodes (10): Build order, Composition (300 pages), Decisions I'd default on unless you object, Dev / test split, Folder layout, Labeling workflow, Scoring, Sourcing (no aggregators) (+2 more)

### Community 90 - "field"
Cohesion: 0.50
Nodes (4): description, enum, type, field

### Community 91 - "emil-design-eng skill (Emil Kowalski design engineering)"
Cohesion: 0.28
Nodes (9): Motion rules (GSAP skeletons, forbidden scroll listeners), Animation decision framework (frequency, purpose, easing, speed), Component building principles (press feedback, origin-aware popovers), Animation performance rules (transform/opacity only), prefers-reduced-motion accessibility guidance, Before/After/Why review table format, emil-design-eng skill (Emil Kowalski design engineering), Spring animations and interruptibility (+1 more)

### Community 92 - "Layout discipline hard rules (hero, eyebrow, zigzag, bento)"
Cohesion: 0.39
Nodes (8): Layout discipline hard rules (hero, eyebrow, zigzag, bento), AIDA page structure and spacing, Mandatory design_plan pre-flight, Gapless bento grid (grid-flow-dense), Hero 2-line iron rule (wide H1 container), Python-driven randomization of layout choices, gpt-taste skill (Awwwards-level GSAP design engineering), Hero minimalism and small-laptop first view

### Community 93 - "scholarship.schema.json"
Cohesion: 0.14
Nodes (13): additionalProperties, $defs, rule, description, $id, required, additionalProperties, allOf (+5 more)

### Community 94 - "imagegen-frontend-mobile skill"
Cohesion: 0.40
Nodes (6): App design bible consistency rule, Logical multi-screen flow rule, Default phone mockup framing rule, Platform mode rule (iOS, Android, cross-platform), Text size and readability rule, imagegen-frontend-mobile skill

### Community 95 - "Mercury social proof (logo wall, testimonials, stats strip)"
Cohesion: 0.33
Nodes (6): Mercury landing page snapshot, Mercury social proof (logo wall, testimonials, stats strip), Oura landing page snapshot, Oura member stories testimonials and category cards, Linear landing page snapshot, Linear feature sections (intake, plan, AI, build) with product UI

### Community 96 - "test-sets/package.json"
Cohesion: 0.09
Nodes (21): author, dependencies, ajv, cheerio, pdf-parse, description, ajv, keywords (+13 more)

### Community 97 - "contract/package.json"
Cohesion: 0.14
Nodes (13): author, dependencies, ajv, description, ajv, keywords, license, name (+5 more)

### Community 98 - "brandkit skill"
Cohesion: 0.50
Nodes (5): Brand strategy first (category, metaphor, audience), Default 3x3 brand-kit panel system, Logo concept methods (monogram, negative space, construction geometry), brandkit skill, Brand visual modes (dark developer, security, luxury, etc.)

### Community 99 - "AI tells (forbidden patterns incl. em-dash ban)"
Cohesion: 0.40
Nodes (5): AI tells (forbidden patterns incl. em-dash ban), Final pre-flight check matrix, Banned truncation output patterns, PAUSED handoff marker for long outputs, full-output-enforcement skill

### Community 100 - "interview-me skill"
Cohesion: 0.40
Nodes (5): Confusion Management, interview-me skill, 95% Confidence Stop, One question at a time with guess attached, Confirmed Statement of Intent

### Community 101 - "debugging-and-error-recovery skill"
Cohesion: 0.40
Nodes (5): debugging-and-error-recovery skill, Stop-the-Line Rule, Error output as untrusted data, Save Point Pattern, Increment Cycle

### Community 102 - "Contract (Phase 0)"
Cohesion: 0.50
Nodes (3): Contract (Phase 0), Mismatches found while building this, Not decided here

### Community 103 - "confidence"
Cohesion: 0.50
Nodes (4): maximum, minimum, type, confidence

### Community 104 - "Scholarship Hunter Step 1 Intake Spec"
Cohesion: 0.17
Nodes (11): Scholarship Hunter Step 1 Intake Spec, Affiliations block (highest yield), Effort budget questions, Eligibility avatar tag set, Geography at four levels, Tuitionwing landing page, Landing design system (Geist, yellow accent, pill buttons), Live match feed mock (+3 more)

### Community 105 - "source_url"
Cohesion: 0.50
Nodes (4): source_url, description, pattern, type

### Community 106 - "deadline_kind"
Cohesion: 0.67
Nodes (3): default, enum, deadline_kind

### Community 107 - "Orchestration Patterns"
Cohesion: 0.31
Nodes (9): Orchestration Patterns, Agent Teams (competing-hypothesis debugging), Orchestration anti-patterns (router, persona-calls-persona, paraphrasing orchestrator, deep trees), Pattern 1: Direct invocation, Pattern 3: Parallel fan-out with merge (/ship), Personas (code-reviewer, security-auditor, test-engineer), Pattern 5: Research isolation (Explore subagent), Pattern 4: Sequential user-driven pipeline (+1 more)

### Community 108 - "name"
Cohesion: 0.67
Nodes (3): minLength, type, name

### Community 109 - "Test-set tooling"
Cohesion: 0.33
Nodes (5): Label conventions, Prediction files, Scoring notes, Test-set tooling, Typical run

### Community 110 - "provider_org"
Cohesion: 0.67
Nodes (3): provider_org, minLength, type

### Community 111 - "type"
Cohesion: 0.29
Nodes (7): pattern, type, relevant_fields, description, items, type, items

### Community 112 - "service_obligation"
Cohesion: 0.67
Nodes (3): service_obligation, description, type

### Community 113 - "apply_url"
Cohesion: 0.67
Nodes (3): pattern, type, apply_url

### Community 114 - "verified_at"
Cohesion: 0.67
Nodes (3): verified_at, pattern, type

### Community 115 - "need_based"
Cohesion: 0.67
Nodes (3): description, enum, need_based

## Knowledge Gaps
- **504 isolated node(s):** `$schema`, `name`, `description`, `name`, `url` (+499 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 574 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `agent-skills pack` connect `agent-skills pack` to `simplify-ignore.sh`, `using-agent-skills meta-skill`, `idea-refine skill`, `deprecation-and-migration skill`, `Getting Started with agent-skills`, `Lifecycle slash commands (/spec /plan /build /test /review /ship)`, `code-review-and-quality skill`, `code-reviewer persona`, `Gemini CLI setup`, `constraint-driven-development skill`, `frontend-ui-engineering skill`, `ci-cd-and-automation skill`, `context-engineering skill`, `validate-skills job (skill validators and evals)`, `code-simplification skill`, `web-performance-auditor persona`, `CONTRIBUTING.md`, `interview-me skill`, `debugging-and-error-recovery skill`, `Orchestration Patterns`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `properties` connect `properties` to `confidence`, `source_url`, `deadline_kind`, `name`, `effort`, `provider_org`, `properties`, `service_obligation`, `apply_url`, `verified_at`, `need_based`, `items`, `properties`, `geo_scope`, `scholarship.schema.json`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `idea-refine skill` connect `idea-refine skill` to `interview-me skill`, `agent-skills pack`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `agent-skills pack` (e.g. with `Grilling loop (grill-me)` and `Skill gap issue form`) actually correct?**
  _`agent-skills pack` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `Getting Started with agent-skills` (e.g. with `OpenCode Setup` and `Using agent-skills with Windsurf`) actually correct?**
  _`Getting Started with agent-skills` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `name`, `description` to the rest of the system?**
  _504 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `questionnaire/app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08708357685563997 - nodes in this community are weakly interconnected._