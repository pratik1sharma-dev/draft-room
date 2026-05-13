type Level = 'info' | 'warn' | 'error'

function log(level: Level, msg: string, ctx?: Record<string, unknown>) {
  const entry = JSON.stringify({ level, msg, t: new Date().toISOString(), ...ctx })
  if (level === 'error') console.error(entry)
  else console.log(entry)
}

export const logger = {
  info:  (msg: string, ctx?: Record<string, unknown>) => log('info',  msg, ctx),
  warn:  (msg: string, ctx?: Record<string, unknown>) => log('warn',  msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log('error', msg, ctx),
}
