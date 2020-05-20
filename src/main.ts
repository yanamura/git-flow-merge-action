import * as core from '@actions/core'
import {context, GitHub} from '@actions/github'

async function run(): Promise<void> {
  try {
    const branch: string = core.getInput('branch')
    core.info(branch)
    const octokit = new GitHub(core.getInput('github_token'))

    await octokit.repos.merge({
      ...context.repo,
      base: 'master',
      head: branch
    })

    await octokit.repos.merge({
      ...context.repo,
      base: 'develop',
      head: branch
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
