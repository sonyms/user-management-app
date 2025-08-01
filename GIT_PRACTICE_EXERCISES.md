# 🎮 Git Hands-On Practice Exercises

Follow these exercises to master Git step by step. Each exercise builds on the previous one.

## 🏃‍♂️ Exercise 1: Git Basics (15 minutes)

### Setup
```bash
# Create a practice directory
mkdir git-practice
cd git-practice
git init

# Configure Git (if not done globally)
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Tasks
1. **Create files and make commits**
   ```bash
   echo "Hello Git!" > hello.txt
   git add hello.txt
   git commit -m "Add hello.txt"
   
   echo "Learning Git is fun!" > learning.txt
   git add learning.txt
   git commit -m "Add learning.txt"
   ```

2. **Practice checking status and logs**
   ```bash
   git status
   git log
   git log --oneline
   ```

3. **Modify and commit changes**
   ```bash
   echo "Git is awesome!" >> hello.txt
   git add hello.txt
   git commit -m "Update hello.txt with enthusiasm"
   ```

### ✅ Success Criteria
- Repository initialized
- At least 3 commits made
- Can view commit history

---

## 🌿 Exercise 2: Branching Basics (20 minutes)

### Tasks
1. **Create and switch to a new branch**
   ```bash
   git branch feature/new-content
   git checkout feature/new-content
   # Or in one command: git checkout -b feature/new-content
   ```

2. **Make changes in the branch**
   ```bash
   echo "This is new feature content" > feature.txt
   git add feature.txt
   git commit -m "Add feature.txt"
   
   echo "More content" >> learning.txt
   git add learning.txt
   git commit -m "Update learning.txt in feature branch"
   ```

3. **Switch back to main and merge**
   ```bash
   git checkout main
   git merge feature/new-content
   ```

4. **Clean up**
   ```bash
   git branch -d feature/new-content
   ```

### ✅ Success Criteria
- Created a feature branch
- Made commits in the branch
- Successfully merged back to main
- Deleted the feature branch

---

## 🌐 Exercise 3: Remote Repository (25 minutes)

### Setup
1. Create a repository on GitHub called `git-practice`
2. Don't initialize with README (we already have content)

### Tasks
1. **Connect local repository to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/git-practice.git
   git branch -M main
   git push -u origin main
   ```

2. **Create a feature branch and push it**
   ```bash
   git checkout -b feature/remote-practice
   echo "Working with remotes" > remote.txt
   git add remote.txt
   git commit -m "Add remote practice file"
   git push -u origin feature/remote-practice
   ```

3. **Simulate collaboration**
   - Go to GitHub and create a file directly on the website
   - Add `collaboration.txt` with some content
   - Commit directly on GitHub

4. **Pull changes locally**
   ```bash
   git checkout main
   git pull origin main
   ```

### ✅ Success Criteria
- Local repository connected to GitHub
- Pushed branches to remote
- Pulled changes from remote

---

## ⚡ Exercise 4: Advanced Operations (30 minutes)

### Stashing Practice
1. **Make some changes without committing**
   ```bash
   echo "Work in progress" > wip.txt
   echo "Temporary changes" >> hello.txt
   ```

2. **Stash the changes**
   ```bash
   git stash save "Work in progress on new feature"
   git status  # Should be clean
   ```

3. **Work on something else**
   ```bash
   echo "Urgent fix" > hotfix.txt
   git add hotfix.txt
   git commit -m "Add urgent hotfix"
   ```

4. **Restore stashed work**
   ```bash
   git stash pop
   git add .
   git commit -m "Complete work in progress"
   ```

### Rebase Practice
1. **Create a feature branch**
   ```bash
   git checkout -b feature/rebase-practice
   echo "Feature 1" > f1.txt
   git add f1.txt
   git commit -m "Add feature 1"
   
   echo "Feature 2" > f2.txt
   git add f2.txt
   git commit -m "Add feature 2"
   ```

2. **Switch to main and add commits**
   ```bash
   git checkout main
   echo "Main work" > main-work.txt
   git add main-work.txt
   git commit -m "Add main work"
   ```

3. **Rebase feature branch**
   ```bash
   git checkout feature/rebase-practice
   git rebase main
   ```

4. **Merge clean history**
   ```bash
   git checkout main
   git merge feature/rebase-practice
   ```

### ✅ Success Criteria
- Successfully used git stash
- Completed a rebase operation
- Maintained clean commit history

---

## 🆘 Exercise 5: Troubleshooting (20 minutes)

### Scenario 1: Wrong Commit Message
```bash
echo "Quick fix" > quickfix.txt
git add quickfix.txt
git commit -m "Quck fix"  # Oops, typo!

# Fix it
git commit --amend -m "Quick fix for typo"
```

### Scenario 2: Committed to Wrong Branch
```bash
# You're on main but should be on feature branch
echo "Feature code" > wrong-branch.txt
git add wrong-branch.txt
git commit -m "Add feature code"

# Fix it
git checkout -b feature/correct-branch
git checkout main
git reset --hard HEAD~1  # Remove commit from main
git checkout feature/correct-branch
# Commit is now on correct branch
```

### Scenario 3: Need to Undo Changes
```bash
# Make some bad changes
echo "Bad code" > bad.txt
git add bad.txt
git commit -m "Add bad code"

# Revert it (safe way)
git revert HEAD
```

### ✅ Success Criteria
- Fixed commit message
- Moved commit to correct branch
- Successfully reverted changes

---

## 🏆 Exercise 6: Professional Workflow (40 minutes)

### Simulate a real project workflow

1. **Setup project structure**
   ```bash
   mkdir src tests docs
   echo "console.log('Hello World');" > src/app.js
   echo "# My Project" > docs/README.md
   echo "describe('App', () => {});" > tests/app.test.js
   git add .
   git commit -m "Initial project structure"
   ```

2. **Feature development workflow**
   ```bash
   # Start new feature
   git checkout -b feature/user-authentication
   
   # Work on feature (multiple commits)
   echo "function login() {}" > src/auth.js
   git add src/auth.js
   git commit -m "Add login function"
   
   echo "function logout() {}" >> src/auth.js
   git add src/auth.js
   git commit -m "Add logout function"
   
   echo "test('login works', () => {});" > tests/auth.test.js
   git add tests/auth.test.js
   git commit -m "Add authentication tests"
   ```

3. **Code review simulation**
   ```bash
   # Push feature branch
   git push -u origin feature/user-authentication
   
   # Create pull request on GitHub
   # (Go to GitHub and create PR)
   ```

4. **Merge and cleanup**
   ```bash
   # After PR is approved and merged on GitHub
   git checkout main
   git pull origin main
   git branch -d feature/user-authentication
   git push origin --delete feature/user-authentication
   ```

### ✅ Success Criteria
- Followed professional workflow
- Created meaningful commits
- Used feature branches
- Cleaned up after merge

---

## 📊 Progress Tracker

Track your Git mastery progress:

### Basic Level (Exercises 1-2)
- [ ] Repository initialization
- [ ] Basic commits
- [ ] Branch creation and merging
- [ ] Git status and log

### Intermediate Level (Exercises 3-4)
- [ ] Remote repository operations
- [ ] Push and pull
- [ ] Stashing
- [ ] Rebasing

### Advanced Level (Exercises 5-6)
- [ ] Troubleshooting and recovery
- [ ] Professional workflows
- [ ] Pull requests
- [ ] Branch management

---

## 🎯 Next Challenge

After completing all exercises, try these real-world scenarios:

1. **Contribute to an open source project**
   - Find a beginner-friendly project on GitHub
   - Fork it, make a small improvement
   - Create a pull request

2. **Set up a team workflow**
   - Invite a friend to collaborate
   - Practice code reviews
   - Handle merge conflicts together

3. **Automate with Git hooks**
   - Set up pre-commit hooks
   - Add automated testing
   - Create deployment hooks

---

## 💡 Pro Tips

1. **Use aliases** for common commands
2. **Write meaningful commit messages**
3. **Keep commits small and focused**
4. **Use branches for everything**
5. **Pull before you push**
6. **Review changes before committing**
7. **Don't panic - Git can recover almost anything**

---

*Remember: Git mastery comes with practice. Don't rush through these exercises - take time to understand each concept.*
