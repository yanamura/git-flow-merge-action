import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'

const octokit = getOctokit(core.getInput('github_token'))

async function merge(branch: string, to: string): Promise<string> {
  core.info(`merge branch:${branch} to: ${to}`)

  // check already merged
  const branchResponse = await octokit.rest.repos.getBranch({
    ...context.repo,
    branch: branch
  })
  const branchSha = branchResponse.data.commit.sha
  core.info(`branch_sha = ${branchSha}`)

  const toResponse = await octokit.rest.repos.getBranch({
    ...context.repo,
    branch: to
  })
  const toSha = toResponse.data.commit.sha
  core.info(`to_sha = ${toSha}`)

  const commits = await octokit.rest.repos.listCommits({
    ...context.repo,
    sha: toSha
  })
  let isMerged = false
  for (let i = 0; i < commits.data.length; i++) {
    const commit = commits.data[i]
    if (commit.sha == branchSha) {
      isMerged = true
      break
    }
  }

  if (isMerged) {
    core.info(`sha = ${toSha}`)
    return toSha
  } else {
    const mergeResponse = await octokit.rest.repos.merge({
      ...context.repo,
      base: to,
      head: branch
    })
    const newMasterSha = mergeResponse.data.sha
    core.info(`sha = ${newMasterSha}`)
    return newMasterSha
  }
}

async function addTag(tag: string, sha: string): Promise<void> {
  await octokit.rest.git.createRef({
    ...context.repo,
    ref: `refs/tags/${tag}`,
    sha
  })
}

async function run(): Promise<void> {
  const branch: string = core.getInput('branch')
  core.info(`branch name=${branch}`)

  let newMasterSha = ''
  const mainBranch: string = core.getInput('main_branch')
  core.info(`main branch name=${mainBranch}`)
  try {
    newMasterSha = await merge(branch, mainBranch)
  } catch (error) {
    core.setFailed(`${mainBranch} merge failed::${error}`)
  }

  const tag: string = core.getInput('tag')
  if (tag) {
    core.info(`tag name=${tag}`)
    try {
      await addTag(tag, newMasterSha)
    } catch (error) {
      core.setFailed(`add tag failed::${error}`)
    }
  }

  try {
    await merge(branch, core.getInput('develop_branch'))
  } catch (error) {
    core.setFailed(`develop merge failed::${error}`)
  }
}

run()
