import * as core from '@actions/core'
import {context, GitHub} from '@actions/github'

async function run(): Promise<void> {
  try {
    const branch: string = core.getInput('branch')
    core.info(branch)
    const tag: string = core.getInput('tag')
    core.info(tag)
    const octokit = new GitHub(core.getInput('github_token'))

    const response = await octokit.repos.merge({
      ...context.repo,
      base: 'master',
      head: branch
    })

    core.info(response.data.sha)

    /*await octokit.git.createTag({
      ...context.repo,
      tag,
      message: '',
      object: response.data.sha,
      type: 'commit'
    })*/

    await octokit.git.createRef({
      ...context.repo,
      ref: `refs/tags/${tag}`,
      sha: response.data.sha
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
