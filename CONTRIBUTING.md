# Contributing to Canvas Discord Bot

First off, thank you for considering contributing to Canvas Discord Bot! It's people like you that make this bot such a great tool.

## Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](https://github.com/ICEPrey/Canvas-Discord-Bot/issues) page to see if someone else has already created a ticket. If not, go ahead and [make one](https://github.com/ICEPrey/Canvas-Discord-Bot/issues/new)!

## Fork & create a branch

If this is something you think you can fix, then [fork Canvas Discord Bot](https://github.com/ICEPrey/Canvas-Discord-Bot/fork) and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```
git checkout -b 325-add-japanese-translations
```

## Get the test suite running

Make sure you're using the latest version of Bun. Install the development dependencies:

```
bun install
```

## Implement your fix or feature

At this point, you're ready to make your changes! Feel free to ask for help; everyone is a beginner at first.

## Make a Pull Request

At this point, you should switch back to your main branch and make sure it's up to date with the main branch:

```bash
git remote add upstream git@github.com:ICEPrey/Canvas-Discord-Bot.git
git checkout main
git pull upstream main
```

Then update your feature branch from your local main branch, and push it!

```bash
git checkout 325-add-japanese-translations
git rebase main
git push --set-upstream origin 325-add-japanese-translations
```

Finally, go to GitHub and [make a Pull Request](https://github.com/ICEPrey/Canvas-Discord-Bot/compare) :D

## Keeping your Pull Request updated

If a maintainer asks you to "rebase" your PR, they're saying that a lot of code has changed, and that you need to update your branch so it's easier to merge.

To learn more about rebasing in Git, there are a lot of [good](https://git-scm.com/book/en/v2/Git-Branching-Rebasing) [resources](https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase) but here's the suggested workflow:

```bash
git checkout 325-add-japanese-translations
git pull --rebase upstream main
git push --force-with-lease origin 325-add-japanese-translations
```

## Code review

A team member will review your pull request and provide feedback. Please be patient as review times may vary.

## Thank you!

Canvas Discord Bot is a community effort. We encourage you to pitch in and join the team!

Thanks! ❤️ ❤️ ❤️

Canvas Discord Bot Team
