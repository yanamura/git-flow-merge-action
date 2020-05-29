# Git-flow Merge

This action merge specified branch to `develop` and `master` branch, and add tag.

If you're using `release branch` or `hotfix branch` of [gitflow-workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) on your project.

This action will help you when release or hotfix branch is ready to ship.

## Usage

```yaml
    - uses: actions/checkout@v1
    - name: Extract branch name
      shell: bash
      run: echo "##[set-output name=branch;]$(echo ${GITHUB_REF#refs/heads/})"
      id: extract_branch
    - name: Extract tag name
      shell: bash
      run: |
        branch=${{ steps.extract_branch.outputs.branch }}
        echo "##[set-output name=tag;]$(echo ${branch#release/})"
      id: extract_tag
    - uses: yanamura/git-flow-merge-action@v1
      with: 
        ### GITHUB_TOKEN.(required)
        github_token: ${{ secrets.GITHUB_TOKEN }}

        ### branch name which merged to develop and master branch.(required)
        ### ex. release/1.1.0, hotfix_branch
        branch: ${{ steps.extract_branch.outputs.branch }}

        ### develop branch name. default: develop (optional).
        develop_branch: 'dev'

        ### tag name which tagged to master.(optional)
        ### ex. v1.1.0
        tag: ${{ steps.extract_tag.outputs.tag }}
```

## How to get branch name

### when trigger is pull_request

use [mdecoleman/pr-branch-name](https://github.com/mdecoleman/pr-branch-name) to get branch name.

```yaml
on:
  pull_request:
    types: [labeled]
jobs:
  automerge:
    if: github.event.label.name == 'release'
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: Extract branch name
      uses: mdecoleman/pr-branch-name@1.0.0
      id: extract_branch
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
    - uses: yanamura/git-flow-merge-action@v1
      with: 
        github_token: ${{ secrets.GITHUB_TOKEN }}
        branch: ${{ steps.extract_branch.outputs.branch }}
```

### when trigger is not pull_request

use [GITHUB_REF](https://help.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables#default-environment-variables)

```
${GITHUB_REF#refs/heads/}
```

```yaml
on:
  push:
    branches:
      - release/*
    types: [created]
jobs:
  automerge:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: yanamura/git-flow-merge-action@v1
      with: 
        github_token: ${{ secrets.GITHUB_TOKEN }}
        branch: ${GITHUB_REF#refs/heads/}
```
