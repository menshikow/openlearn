---
description: Create task specification using spec-driven development
agent: mentor
---

# /openlearn-task

Plan a new task using spec-driven development.

## Important: Student Writes All Code

This command helps plan tasks. Before creating any spec files:
1. Explain what files will be created
2. Ask for permission
3. Only proceed with explicit confirmation

Maximum 5 lines of example code at a time.

## Flow

1. **Check roadmap**
   - Read `.opencode/openlearn/product/roadmap.md`
   - If roadmap exists with incomplete phase:
     - Show current phase tasks
     - Ask: "Which task are you implementing?"
   - If no roadmap: Ask for task name

2. **Gather requirements**
   - Ask: "What should this task accomplish?" (free text, single input)
   - Ask: "Who will use it?" (free text, single input)
   - Ask: "What does success look like?" (free text, single input)
   - Discuss edge cases

### Question UI rules

- For free-text requirement questions, use one text-entry path only.
- Do not add placeholder options such as "Type your answer".
- For strict multiple-choice questions, disable custom input.

3. **Research with Context7** (if enabled)
   - Query Context7 for relevant documentation
   - Check for patterns and best practices
   - Review similar examples

4. **Socratic architecture discussion**
   - "What components will you need?"
   - "What data structures make sense?"
   - "What API endpoints are required?"
   - "How will state be managed?"

5. **File creation confirmation**
   - Show list of files to be created:
     - `.opencode/openlearn/specs/active/phase-[N]-[name]/spec.md`
     - `.opencode/openlearn/specs/active/phase-[N]-[name]/design.md`
     - `.opencode/openlearn/specs/active/phase-[N]-[name]/tasks.md`
   - Ask: "Create these spec files? [Y/n]"
   - If no: Explain how to create manually

6. **Generate spec files** (with permission)
   - Only proceed if student confirms
   - Create all three spec files

7. **Present for review**
   - Show generated specs
   - Ask for changes
   - Confirm or iterate

8. **Next steps**
   - "Ready to implement? Use `/openlearn-guide` if you need help"

## Example Session

```
Student: /openlearn-task

OpenLearn: Checking roadmap...
[Reads roadmap.md]

OpenLearn: You're in Phase 1: Foundation. 
What task are you implementing?
Student: Add a todo item

OpenLearn: What should this task accomplish?
Student: Let users type a task and add it to the list

OpenLearn: What does success look like?
Student: User can type, press enter or click add, see it in the list

--- Context7 Research ---
[If mode is auto, queries Context7 for React forms and state management]

OpenLearn: I see you'll need form handling. Let's discuss the approach.

--- Architecture Discussion ---

OpenLearn: What components do you think you'll need?
Student: An input field and a button

OpenLearn: Good! What about the list itself?
Student: Maybe a separate TodoList component?

OpenLearn: Exactly! How will the new todo get added to the list?
Student: Lift state up? Pass a function down?

OpenLearn: Perfect thinking! That's the React pattern.

--- Creating Specs ---

OpenLearn: I'll create the following spec files:
- phase-1-add-todo-item/spec.md
- phase-1-add-todo-item/design.md
- phase-1-add-todo-item/tasks.md

Create these files? [Y/n]
Student: Y

[Creates spec files]

OpenLearn: I've created your task spec:

📄 spec.md - Requirements and acceptance criteria
📄 design.md - Technical approach  
📄 tasks.md - Implementation checklist

Would you like to review or change anything?

Student: Looks good!

OpenLearn: Great! Start with the first task. 
Use `/openlearn-guide` if you need help, `/openlearn-stuck` if you get stuck.
```
