import * as core from '@actions/core'
import {context, GitHub} from '@actions/github'

const octokit = new GitHub(core.getInput('github_token'))

async function merge(branch: string, to: string): Promise<string> {
  core.info(`merge branch:${branch} to: ${to}`)
  const response = await octokit.repos.merge({
    ...context.repo,
    base: to,
    head: branch
  })
  const newMasterSha = response.data.sha
  core.info(`sha = ${newMasterSha}`)
  return newMasterSha
}

async function addTag(tag: string, sha: string): Promise<void> {
  await octokit.git.createRef({
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
    core.setFailed(`${mainBranch} merge failed::${error.message}`)
  }

  const tag: string = core.getInput('tag')
  if (tag) {
    core.info(`tag name=${tag}`)
    try {
      await addTag(tag, newMasterSha)
    } catch (error) {
      core.setFailed(`add tag failed::${error.message}`)
    }
  }

  try {
    await merge(branch, core.getInput('develop_branch'))
  } catch (error) {
    core.setFailed(`develop merge failed::${error.message}`)
  }
}

run()
