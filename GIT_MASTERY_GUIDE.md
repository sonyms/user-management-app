# 🎯 Complete Git Mastery Guide

From Zero to Git Hero - A comprehensive guide to mastering Git version control.

## 📚 Table of Contents

1. [Git Fundamentals](#git-fundamentals)
2. [Basic Commands](#basic-commands)
3. [Branching & Merging](#branching--merging)
4. [Remote Repositories](#remote-repositories)
5. [Advanced Git Techniques](#advanced-git-techniques)
6. [Git Workflows](#git-workflows)
7. [Troubleshooting & Recovery](#troubleshooting--recovery)
8. [Best Practices](#best-practices)
9. [Professional Tips](#professional-tips)

---

## 🔧 Git Fundamentals

### What is Git?
Git is a **distributed version control system** that tracks changes in files and coordinates work among multiple people.

### Key Concepts
- **Repository (Repo)**: A project folder tracked by Git
- **Commit**: A snapshot of your project at a specific point
- **Branch**: A parallel version of your repository
- **Remote**: A version of your project hosted elsewhere (GitHub, GitLab)
- **Working Directory**: Your local files
- **Staging Area**: Files ready to be committed
- **HEAD**: Pointer to your current branch/commit

### Git States
```
Working Directory → Staging Area → Repository
     (modified)   →   (staged)   →  (committed)
```

---

## 🚀 Basic Commands

### Setup & Configuration
```bash
# Set global username and email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Check configuration
git config --list

# Set default editor
git config --global core.editor "code --wait"  # VS Code
git config --global core.editor "vim"          # Vim
```

### Repository Initialization
```bash
# Initialize new repository
git init

# Clone existing repository
git clone https://github.com/username/repo.git
git clone https://github.com/username/repo.git my-folder-name
```

### Basic Workflow
```bash
# Check status
git status

# Add files to staging
git add filename.txt          # Add specific file
git add .                     # Add all files
git add *.js                  # Add all .js files
git add -A                    # Add all changes (including deletions)

# Commit changes
git commit -m "Your commit message"
git commit -am "Add and commit in one step"  # For tracked files only

# View commit history
git log
git log --oneline             # Compact view
git log --graph --oneline     # Visual branch graph
```

---

## 🌿 Branching & Merging

### Branch Basics
```bash
# List branches
git branch                    # Local branches
git branch -r                 # Remote branches
git branch -a                 # All branches

# Create new branch
git branch feature-name
git checkout -b feature-name  # Create and switch
git switch -c feature-name    # Modern way (Git 2.23+)

# Switch branches
git checkout branch-name
git switch branch-name        # Modern way

# Delete branch
git branch -d branch-name     # Safe delete
git branch -D branch-name     # Force delete
```

### Merging
```bash
# Merge branch into current branch
git merge feature-branch

# Merge strategies
git merge --no-ff feature-branch    # Create merge commit
git merge --squash feature-branch   # Squash all commits into one
```

### Rebasing
```bash
# Rebase current branch onto main
git rebase main

# Interactive rebase (last 3 commits)
git rebase -i HEAD~3

# Continue/abort rebase
git rebase --continue
git rebase --abort
```

---

## 🌐 Remote Repositories

### Remote Management
```bash
# Add remote
git remote add origin https://github.com/username/repo.git

# List remotes
git remote -v

# Change remote URL
git remote set-url origin https://github.com/username/new-repo.git

# Remove remote
git remote remove origin
```

### Push & Pull
```bash
# Push to remote
git push origin main
git push -u origin main       # Set upstream tracking

# Pull from remote
git pull origin main
git pull                      # If upstream is set

# Fetch (download without merging)
git fetch origin
git fetch --all
```

### Tracking Branches
```bash
# Create local branch tracking remote
git checkout -b local-branch origin/remote-branch

# Set upstream for existing branch
git push -u origin branch-name
git branch --set-upstream-to=origin/main main
```

---

## ⚡ Advanced Git Techniques

### Stashing
```bash
# Stash changes
git stash
git stash save "Work in progress on feature X"

# List stashes
git stash list

# Apply stash
git stash apply               # Keep stash
git stash pop                 # Apply and remove stash
git stash apply stash@{2}     # Apply specific stash

# Clear stashes
git stash drop stash@{0}      # Drop specific stash
git stash clear               # Clear all stashes
```

### Cherry-picking
```bash
# Apply specific commit to current branch
git cherry-pick commit-hash
git cherry-pick commit1 commit2  # Multiple commits
```

### Reset & Revert
```bash
# Reset (dangerous - changes history)
git reset --soft HEAD~1       # Keep changes staged
git reset --mixed HEAD~1      # Keep changes unstaged (default)
git reset --hard HEAD~1       # Discard changes completely

# Revert (safe - creates new commit)
git revert commit-hash
git revert HEAD               # Revert last commit
```

### Tagging
```bash
# Create tag
git tag v1.0.0
git tag -a v1.0.0 -m "Version 1.0.0 release"

# List tags
git tag

# Push tags
git push origin v1.0.0
git push origin --tags        # Push all tags
```

---

## 📊 Git Workflows

### 1. Feature Branch Workflow
```bash
# 1. Create feature branch
git checkout -b feature/user-authentication

# 2. Work on feature
git add .
git commit -m "Add user login functionality"

# 3. Push feature branch
git push -u origin feature/user-authentication

# 4. Create Pull Request on GitHub
# 5. After review, merge and delete branch
git checkout main
git pull origin main
git branch -d feature/user-authentication
```

### 2. Gitflow Workflow
```bash
# Main branches: main, develop
# Feature branches: feature/*
# Release branches: release/*
# Hotfix branches: hotfix/*

# Start feature
git checkout develop
git checkout -b feature/new-feature

# Finish feature
git checkout develop
git merge feature/new-feature
git branch -d feature/new-feature
```

### 3. GitHub Flow
```bash
# Simple workflow for continuous deployment
# 1. Create branch from main
# 2. Add commits
# 3. Open Pull Request
# 4. Deploy and test
# 5. Merge to main
```

---

## 🆘 Troubleshooting & Recovery

### Common Problems & Solutions

#### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

#### Undo Last Commit (Discard Changes)
```bash
git reset --hard HEAD~1
```

#### Fix Commit Message
```bash
git commit --amend -m "New commit message"
```

#### Recover Deleted Branch
```bash
# Find the commit hash
git reflog
# Recreate branch
git checkout -b recovered-branch commit-hash
```

#### Resolve Merge Conflicts
```bash
# 1. Git will mark conflicts in files
# 2. Edit files to resolve conflicts
# 3. Add resolved files
git add resolved-file.txt
# 4. Complete merge
git commit
```

#### Clean Working Directory
```bash
git clean -n                  # Preview what will be deleted
git clean -f                  # Delete untracked files
git clean -fd                 # Delete untracked files and directories
```

---

## ✨ Best Practices

### Commit Messages
```bash
# Good commit messages
git commit -m "Add user authentication feature"
git commit -m "Fix memory leak in data processing"
git commit -m "Update README with installation instructions"

# Conventional Commits format
git commit -m "feat: add user login functionality"
git commit -m "fix: resolve memory leak in parser"
git commit -m "docs: update API documentation"
```

### Branch Naming
```bash
# Good branch names
feature/user-authentication
bugfix/fix-memory-leak
hotfix/security-patch
release/v1.2.0
```

### .gitignore Best Practices
```gitignore
# Dependencies
node_modules/
target/

# Build outputs
dist/
build/
*.class

# Environment files
.env
.env.local

# IDE files
.vscode/
.idea/
*.swp

# OS files
.DS_Store
Thumbs.db
```

---

## 🏆 Professional Tips

### Aliases (Make Git Faster)
```bash
# Set up useful aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'

# Now you can use:
git st        # instead of git status
git co main   # instead of git checkout main
```

### Advanced Log Commands
```bash
# Beautiful log with graph
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

# Create alias for above
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

# Show changes in last commit
git show

# Show files changed in last commit
git diff --name-only HEAD~1 HEAD
```

### Productivity Hooks
```bash
# Pre-commit hook example (goes in .git/hooks/pre-commit)
#!/bin/sh
# Run tests before each commit
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Commit aborted."
  exit 1
fi
```

---

## 🎯 Practice Exercises

### Beginner Level
1. Initialize a repository
2. Create and commit some files
3. Create a branch and make changes
4. Merge the branch back to main

### Intermediate Level
1. Set up a remote repository
2. Practice rebasing instead of merging
3. Use stash to save work temporarily
4. Resolve merge conflicts

### Advanced Level
1. Use interactive rebase to clean up history
2. Set up Git hooks
3. Practice cherry-picking commits
4. Master the reflog for recovery

---

## 📖 Additional Resources

### Essential Reading
- [Pro Git Book](https://git-scm.com/book) (Free online)
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)
- [GitHub Git Handbook](https://guides.github.com/introduction/git-handbook/)

### Interactive Learning
- [Learn Git Branching](https://learngitbranching.js.org/) (Visual tutorial)
- [GitHub Learning Lab](https://lab.github.com/)
- [Katacoda Git Scenarios](https://www.katacoda.com/courses/git)

### Tools
- **GUI Clients**: GitKraken, SourceTree, GitHub Desktop
- **VS Code Extensions**: GitLens, Git Graph
- **Terminal Tools**: tig, lazygit

---

## 🚀 Next Steps

1. **Start with basics** - Master add, commit, push, pull
2. **Practice branching** - Create feature branches for every change
3. **Learn to read logs** - Understand your project history
4. **Master merging** - Both merge and rebase strategies
5. **Contribute to open source** - Practice with real projects
6. **Teach others** - Best way to solidify your knowledge

---

*Remember: Git mastery comes with practice. Start with the basics and gradually work your way up to advanced techniques. Don't be afraid to experiment in test repositories!*
