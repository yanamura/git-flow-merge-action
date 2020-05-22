# Git-flow Merge

This action merge specified branch to develop and master.

# Usage

```yaml
    - name: Extract branch name
      shell: bash
      run: echo "##[set-output name=branch;]$(echo ${GITHUB_REF#refs/heads/})"
      id: extract_branch
    - uses: ./
      with: 
        github_token: ${{ secrets.GITHUB_TOKEN }}
        branch: ${{ steps.extract_branch.outputs.branch }}
```

