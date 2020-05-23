import * as core from '@actions/core'
import {context, GitHub} from '@actions/github'

async function run(): Promise<void> {
  const branch: string = core.getInput('branch')
  core.info(`branch name=${branch}`)

  const octokit = new GitHub(core.getInput('github_token'))

  let newMasterSha = ''
  try {
    const response = await octokit.repos.merge({
      ...context.repo,
      base: 'master',
      head: branch
    })
    newMasterSha = response.data.sha
    core.info(`sha = ${newMasterSha}`)
  } catch (error) {
    core.setFailed(`master merge failed::${error.message}`)
  }

  const tag: string = core.getInput('tag')
  if (tag) {
    core.info(`tag name=${tag}`)
    try {
      await octokit.git.createRef({
        ...context.repo,
        ref: `refs/tags/${tag}`,
        sha: newMasterSha
      })
    } catch (error) {
      core.setFailed(`add tag failed::${error.message}`)
    }
  }

  try {
    await octokit.repos.merge({
      ...context.repo,
      base: 'develop',
      head: branch
    })
  } catch (error) {
    core.setFailed(`develop merge failed::${error.message}`)
  }
}

run()
