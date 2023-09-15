import fetch from 'node-fetch'
import lifecycleSuccess from '../../lib/lifecycle-success'
import teamsify from '../../lib/teamsify'

jest.mock('node-fetch', () => ({
  fetch: jest.fn(),
}))

jest.mock('../../lib/teamsify', () => jest.fn())

jest.mock('../../lib/getUrl', () => jest.fn(() => 'https://example.com'))

describe.skip('lifecycleSuccess', () => {
  let logger
  let env
  let options
  let pluginConfig
  let context

  beforeEach(() => {
    logger = {
      log: jest.fn(),
      error: jest.fn(),
    }
    env = {}
    options = {}
    pluginConfig = {}
    context = { logger, env, options }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when teamsify succeeds', () => {
    beforeEach(() => {
      teamsify.mockResolvedValueOnce('Release notes')
    })

    it('should send a notification to Teams', async () => {
      await lifecycleSuccess(pluginConfig, context)
      expect(fetch).toHaveBeenCalledWith('https://example.com', {
        method: 'post',
        body: JSON.stringify('Release notes'),
        headers: { 'Content-Type': 'application/json' },
      })
      expect(logger.log).toHaveBeenCalledWith('Message sent to Microsoft Teams')
      expect(logger.error).not.toHaveBeenCalled()
      expect(env.HAS_PREVIOUS_EXECUTION).toBe(true)
    })

    it('should use the notifyInDryRun option when dryRun is true', async () => {
      options.dryRun = true
      pluginConfig.notifyInDryRun = false
      await lifecycleSuccess(pluginConfig, context)
      expect(fetch).not.toHaveBeenCalled()
      expect(logger.log).not.toHaveBeenCalled()
      expect(logger.error).not.toHaveBeenCalled()
      expect(env.HAS_PREVIOUS_EXECUTION).toBe(true)
    })
  })

  describe('when teamsify fails', () => {
    beforeEach(() => {
      teamsify.mockRejectedValueOnce(new Error('Failed to generate release notes'))
      fetch.mockClear()
    })

    it('should log an error and not send a notification to Teams', async () => {
      await lifecycleSuccess(pluginConfig, context)
      expect(fetch).not.toHaveBeenCalled()
      expect(logger.log).not.toHaveBeenCalled()
      expect(logger.error).toHaveBeenCalledTimes(2)
      expect(logger.error).toHaveBeenCalledWith('An error occurred while parsing the release notes.')
      expect(logger.error).toHaveBeenCalledWith(new Error('Failed to generate release notes'))
      expect(env.HAS_PREVIOUS_EXECUTION).toBe(true)
    })
  })
})