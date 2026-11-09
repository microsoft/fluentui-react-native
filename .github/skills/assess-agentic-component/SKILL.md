---
name: assess-agentic-component
description: Assess readiness of agentic components and primitives against their complete contracts and current execution evidence. Review or maintain acceptance mappings, explain provisional maturity and gaps, and reassess after authoring. Not component implementation, test authoring, or native test-runner repair.
license: MIT
---

# Assess an agentic component

This skill owns semantic assessment. Shared commands validate and summarize evidence; a CI report alone does not
establish that a contract's acceptance checklist is complete.

Read the [package instructions](../../../packages/agentic/components/AGENTS.md) and follow the
[assessment workflow](../../../packages/agentic/components/references/assessments/README.md#skill-led-workflow).
Use that reference for mapping formats, evidence rules, commands, and provisional maturity policy.

Assess the requested component or primitive, or the complete discovered inventory when explicitly requested. Read its
entire normative contract before evaluating available assertions. Retain every unproven acceptance check and distinguish
mocked JavaScript, compiler, native renderer/input lanes, visual observations, and reviewed manual evidence.

After an authoring change, assess the changed control and any affected public primitives without restarting the completed
implementation workflow or repeating fresh tests unnecessarily. Mapping maintenance does not authorize implementation,
contract, policy, privacy, CI-permission, or release-status changes.

Return the supported advisory level, limiting dimensions, exact evidence provenance, uncovered checks, and any
unsupported or unrun targets. No separate owner approval is required for an advisory assessment; never invent owner
endorsements or treat an accessible-input pass as screen-reader validation.
