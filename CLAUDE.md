CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Project Overview
This repository contains documentation and conceptual exploration of the "Momentary Manifesto" - a software design philosophy advocating for ephemeral applications that exist only when needed and dissolve completely afterward, while maintaining continuity through user-owned state.

Repository Structure
This is a documentation-focused repository with the following key files:

README.md - The Momentary Manifesto 2.0, outlining core principles for ephemeral software design
are-we-ready.md - Academic exploration of the manifesto's theoretical foundations and practical implications
DEVELOPMENT.md - Core development practices (TDD, TypeScript, functional patterns)
MOMENTARY-DEV-GUIDELINES.md - Momentary-specific development patterns and anti-patterns
devbox.json - Development environment configuration using Devbox
Development Environment
The project uses Devbox for environment management with the following packages:

Node.js (latest)
VS Code (latest)
uv (latest Python package manager)
To set up the development environment:

bash
devbox shell
Core Philosophy
The repository explores software design principles centered around:

Temporary Manifestation - Apps exist only during specific tasks
Bring Your Own State (BYOS) - Users own and control persistent data
Privacy Through Ephemerality - No persistent data collection or tracking
Zero Attention Architecture - No notifications or engagement loops
Residual Optimization - Apps analyzed as resilient residues for specific stressors
Key Concepts
Momentary Applications: Ephemeral apps that manifest when needed and dissolve after task completion
Residuality Theory: Framework for analyzing software systems through stress resistance (reference: O'Reilly, B. M.)
Dynamic Assembly: Complex tasks achieved through orchestration of multiple momentary residues
State Sovereignty: User-controlled persistent data layer separate from application logic
Development Guidelines
Core Development Practices (DEVELOPMENT.md)
Test-Driven Development (non-negotiable)
TypeScript strict mode always
Functional programming patterns with immutable data
No comments in code (self-documenting through clear naming)
Behavior-driven testing (not implementation testing)
Momentary-Specific Patterns (MOMENTARY-DEV-GUIDELINES.md)
Anti-persistence validation - Ensure no data survives dissolution
Memory sanitization - Guarantee complete cleanup
User-owned state interfaces - Respect BYOS principles
Ephemeral resource tracking - Auto-release all handles
Philosophical compliance testing - Validate manifesto adherence
When to Apply Each Guideline
For ANY code in this repository:

Follow DEVELOPMENT.md practices (TDD, TypeScript, functional patterns)
Write self-documenting code without comments
Use behavior-driven testing approaches
For momentary application implementations:

Additionally follow MOMENTARY-DEV-GUIDELINES.md
Implement manifestation-execution-dissolution patterns
Validate against momentary manifesto principles
Include anti-pattern detection and memory cleanup verification
For documentation and exploration:

Focus on clear, purposeful writing aligned with manifesto principles
Maintain consistency with the philosophical framework
Support the theoretical exploration of ephemeral software design
Working with Claude Code
Guidelines for This Project
When working on this documentation-focused repository, Claude should:

Development Approach
ALWAYS follow TDD when writing any code examples or utilities
Apply momentary patterns when creating application examples
Validate philosophical alignment - ensure code embodies manifesto principles
Test dissolution logic - prove complete cleanup in momentary apps
Code Standards
TypeScript strict mode for all code
No comments - use clear, self-documenting names
Immutable, functional patterns aligned with ephemeral design
Anti-persistence validation - never store user data
Documentation Standards
Keep documentation concise and purposeful
Align with the Zero Attention Architecture principle
Focus on single-purpose, stress-resistant explanations
Ensure content supports the Bring Your Own State (BYOS) philosophy
Project-Specific Context
This repository explores ephemeral software design principles
Documentation should reflect the philosophical approach to temporary manifestation and user-owned state
Any code examples should demonstrate momentary application concepts
Maintain consistency with the residuality theory framework
Quality Validation
Ensure all code follows both DEVELOPMENT.md and MOMENTARY-DEV-GUIDELINES.md
Validate that examples embody manifesto principles
Test for complete dissolution and memory cleanup
Verify no anti-patterns are introduced
Development Commands
Since this project uses Devbox, the primary development setup is:

bash
devbox shell  # Enter development environment
File Relationships
CLAUDE.md (this file)
├── DEVELOPMENT.md (core development practices - applies to ALL code)
├── MOMENTARY-DEV-GUIDELINES.md (momentary-specific patterns - applies to momentary apps)
├── README.md (manifesto principles)
├── are-we-ready.md (theoretical exploration)
└── examples/
    └── momentary-calculator/ (reference implementation demonstrating all principles)
When implementing momentary applications, follow BOTH DEVELOPMENT.md AND MOMENTARY-DEV-GUIDELINES.md. When writing general code or documentation, follow DEVELOPMENT.md patterns.

## Reference Implementation

The `examples/momentary-calculator/` directory contains a complete reference implementation that demonstrates:

- Test-driven development with momentary-specific validation
- Manifestation-execution-dissolution lifecycle
- Complete memory cleanup and dissolution
- User-owned state interface (BYOS)
- Anti-pattern detection and philosophical compliance testing
- Functional purity with self-cleaning operations

This example serves as a template for building momentary applications that fully embody the manifesto principles.

