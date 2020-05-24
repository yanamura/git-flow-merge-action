# Git-flow Merge

This action merge specified branch to develop and master.

# Usage

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
    - uses: ./
      with: 
        ### GITHUB_TOKEN.(required)
        github_token: ${{ secrets.GITHUB_TOKEN }}

        ### branch name which merged to develop and master branch.(required)
        ### ex. release/1.1.0, hotfix_branch
        branch: ${{ steps.extract_branch.outputs.branch }}

        ### tag name which tagged to master.(optional)
        ### ex. v1.1.0
        tag: ${{ steps.extract_tag.outputs.tag }}
```

