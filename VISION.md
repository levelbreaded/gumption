# A vision for Gumption

## Things I wanna do with `gum`

Primarily, replace my use of other tools. So my flow now is:

-   Look at all my "tracked" branches easily in some kind tree structure
-   Create a new branch off the current branch, add all edited files and push to
    new branch all in one command
-   Quick command to commit all files to current branch
-   Switch to a branch I didn't create, start tracking it
-   Rebase current branch onto another target branch
-   Alias command for `git rebase --continue`
-   Alias command for `git add .` (while rebasing but also in general)
-   Sync command. Takes all tracked branches, rebase them on main. Any branch
    not branched off main, we rebase onto parent recursively. If a PR for that
    branch is closed, delete the branch
-   Submit a branch straight to github. If it's stacked on something then

## High level behaviour

Only some branches are "tracked". Trying to handle all branches is a bad idea
imo and users should opt-in branches explicitly to be handled in this way.

We will keep track of which branches are being handled this way in some system
file.

## Commands

1. `hop` - list all branches, not just tracked ones, let's you search with
   partial string and then menu select a branch to hop to, basically git switch
   with better search & UI
2. `continue` - basically just `git rebase --continue`
3. `all` - basically just `git add .`
4. `onto` - opens a menu to select a branch, rebases your current branch "onto"
   that chosen branch
5. `track` - start "tracking" current branch
6. `go` / `send` (idk what to call this) - basically `git commit -am ""` and
   takes a message argument
7. `new` - basically `git checkout -b [name] && git commit -am ""`
   where the branch name is auto-generated from the commit message
8. `ls` - view tracked branches in a tree structure visually
9. `up [number]` - go "up" the tree, i.e. to the child of the current branch.
   Show selection options if multiple children. "number" is the number of levels
   up
10. `down [number]` - go "down" the tree, i.e. to parent of current branch.
    "number" is the number of levels down
11. `submit` - submit this branch to github, if it's stacked on something make
    that the target. Option to submit everything in branch of the tree down to
    the root.

## Priorities / Organization

### Low-hanging Fruit

-   `hop` is basically done
-   `all`, `go`, `new` -> should be easy to build, just git aliases basically

### Commands that require we build "the tree"

The tree, meaning the way we internally store the representation of which
branches are stacked on which branches.

-   `sync`, `up`, `down`, `ls`, `track`

### Commands that can be built now, might need to be changed after "the tree"

-   `onto`, `continue`

## Plan

1. Polish `hop`
2. Build `all`
3. Build `go`
4. Build `new`

This is now v0.

5. Build `onto`
6. Build `continue`

This is now v0.1.X

7. Build tree representation.
8. Build `track`
9. Build `ls`
10. Build `up` & `down`

This is v0.2.X

11. Build Github integration to make/track PRs
12. Build `submit`

This is v0.3.X

13. Build `sync`

This is v1.
