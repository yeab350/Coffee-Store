- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
  Ask for project type, language, and frameworks if not specified. Skip if already provided.

- [x] Scaffold the Project
  Ensure that the previous step has been marked as completed. Call the project setup tool with the projectType parameter if needed. Run scaffolding commands in the current working directory. Create structures manually if tooling is unavailable.

- [x] Customize the Project
  Verify that all previous steps have been completed successfully. Develop a plan to modify the codebase according to user requirements and apply the modifications.

- [x] Install Required Extensions
  Only install extensions provided in get_project_setup_info. Mark as complete if none are required.

- [x] Compile the Project
  Confirm earlier steps are complete, install missing dependencies, and run diagnostics. Refer to project markdown files for guidance.

- [ ] Create and Run Task
  Determine whether a VS Code task is required based on project configuration. Use create_and_run_task to add and launch tasks when needed; otherwise, skip this step. No dedicated task required at this time.

- [ ] Launch the Project
  Launch only after confirming prerequisites and obtaining debug preferences from the user.

- [x] Ensure Documentation is Complete
  Verify that README.md and copilot-instructions.md reflect the current project state.

Execution Guidelines
- Use available tools to manage this checklist and update statuses with summaries.
- Maintain concise communication and avoid printing entire command outputs.
- Work within the project root unless instructed otherwise and avoid unnecessary media or external links.
- Create folders only when required and rely on the VS Code API tool solely for extension projects.
- Consider the task complete once the project scaffolding, compilation, documentation, and launch instructions are finalised.
