type LogMethod = (...args: unknown[]) => void

interface Logger {
  debug: LogMethod
  info: LogMethod
  warn: LogMethod
  error: LogMethod
}

function timestamp(): string {
  return new Date().toISOString()
}

const isProduction = process.env.NODE_ENV === 'production'

const logger: Logger = {
  debug: (...args) => {
    if (!isProduction) {
      console.debug(`🔍 DEBUG [${timestamp()}]`, ...args)
    }
  },
  info: (...args) => {
    console.info(`ℹ️ INFO  [${timestamp()}]`, ...args)
  },
  warn: (...args) => {
    console.warn(`⚠️ WARN  [${timestamp()}]`, ...args)
  },
  error: (...args) => {
    console.error(`❌ ERROR [${timestamp()}]`, ...args)
  },
}

export default logger
