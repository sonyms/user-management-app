# 🚀 Git Command Cheat Sheet

Quick reference for Git commands organized by category.

## 📁 Setup & Configuration

```bash
# Global configuration
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global core.editor "code --wait"

# Repository initialization
git init                              # Initialize new repo
git clone <url>                       # Clone existing repo
```

## 📝 Basic Operations

```bash
# Status and information
git status                            # Show working tree status
git log                               # Show commit history
git log --oneline                     # Compact commit history
git show                              # Show last commit details

# Adding and committing
git add <file>                        # Stage specific file
git add .                             # Stage all changes
git add -A                            # Stage all (including deletions)
git commit -m "message"               # Commit with message
git commit -am "message"              # Add and commit (tracked files)
```

## 🌿 Branching

```bash
# Branch operations
git branch                            # List local branches
git branch -a                         # List all branches
git branch <name>                     # Create new branch
git checkout <branch>                 # Switch to branch
git checkout -b <branch>              # Create and switch to branch
git switch <branch>                   # Switch to branch (Git 2.23+)
git switch -c <branch>                # Create and switch (Git 2.23+)

# Merging and deleting
git merge <branch>                    # Merge branch into current
git branch -d <branch>                # Delete branch (safe)
git branch -D <branch>                # Force delete branch
```

## 🌐 Remote Operations

```bash
# Remote management
git remote -v                         # List remotes
git remote add <name> <url>           # Add remote
git remote set-url <name> <url>       # Change remote URL
git remote remove <name>              # Remove remote

# Synchronization
git push <remote> <branch>            # Push branch to remote
git push -u <remote> <branch>         # Push and set upstream
git pull <remote> <branch>            # Pull from remote
git fetch <remote>                    # Fetch without merging
```

## ⚡ Advanced Operations

```bash
# Stashing
git stash                             # Stash current changes
git stash save "message"              # Stash with message
git stash list                        # List all stashes
git stash pop                         # Apply and remove last stash
git stash apply                       # Apply last stash (keep it)
git stash drop                        # Delete last stash

# Rebasing
git rebase <branch>                   # Rebase current branch
git rebase -i HEAD~<n>                # Interactive rebase (last n commits)
git rebase --continue                 # Continue after resolving conflicts
git rebase --abort                    # Abort rebase

# Resetting (be careful!)
git reset --soft HEAD~1               # Undo commit, keep changes staged
git reset --mixed HEAD~1              # Undo commit, keep changes unstaged
git reset --hard HEAD~1               # Undo commit, discard changes

# Other useful commands
git cherry-pick <commit>              # Apply specific commit
git revert <commit>                   # Create commit that undoes another
git tag <name>                        # Create tag
git clean -f                          # Remove untracked files
```

## 🔍 Inspection & Comparison

```bash
# Viewing changes
git diff                              # Show unstaged changes
git diff --staged                     # Show staged changes
git diff <commit1> <commit2>          # Compare commits
git diff <branch1> <branch2>          # Compare branches

# History and blame
git log --graph --oneline             # Visual commit graph
git log --author="name"               # Commits by author
git log --since="2 weeks ago"         # Commits since date
git blame <file>                      # Show who changed each line
git reflog                            # Show all reference changes
```

## 🆘 Emergency Commands

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Amend last commit message
git commit --amend -m "new message"

# Recover deleted branch
git reflog
git checkout -b <branch> <commit-hash>

# Undo merge (if not pushed)
git reset --hard HEAD~1

# Create commit that undoes another (safe)
git revert <commit-hash>

# Discard all local changes
git reset --hard HEAD
git clean -fd
```

## 📋 Useful Aliases

Add these to your `.gitconfig`:

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
```

## 🎯 Workflow Examples

### Feature Branch Workflow
```bash
git checkout -b feature/new-feature   # Create feature branch
# ... make changes ...
git add .
git commit -m "Add new feature"
git push -u origin feature/new-feature
# ... create pull request ...
git checkout main
git pull origin main
git branch -d feature/new-feature
```

### Hotfix Workflow
```bash
git checkout main
git checkout -b hotfix/critical-fix
# ... fix the issue ...
git add .
git commit -m "Fix critical issue"
git checkout main
git merge hotfix/critical-fix
git push origin main
git branch -d hotfix/critical-fix
```

## 🔧 Common Scenarios

### Scenario: Made commits on wrong branch
```bash
git log --oneline                     # Note commit hashes
git reset --hard HEAD~<n>             # Remove commits from current branch
git checkout <correct-branch>
git cherry-pick <commit-hash>         # Apply commits to correct branch
```

### Scenario: Need to sync fork with upstream
```bash
git remote add upstream <original-repo-url>
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### Scenario: Resolve merge conflicts
```bash
git merge <branch>                    # Conflicts occur
# Edit files to resolve conflicts
git add <resolved-files>
git commit                            # Complete the merge
```

---

## 💡 Pro Tips

1. **Always pull before push**: `git pull origin main` before `git push`
2. **Use meaningful commit messages**: Explain WHAT and WHY, not HOW
3. **Commit often**: Small, focused commits are better than large ones
4. **Use branches**: Never work directly on main/master
5. **Review before commit**: Use `git diff --staged` to review changes
6. **Keep history clean**: Use rebase for feature branches, merge for integration

---

*Print this cheat sheet and keep it handy while learning Git!*
