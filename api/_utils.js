export function json(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload, null, 2))
}

export function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) {
    return true
  }

  res.setHeader('Allow', methods.join(', '))
  json(res, 405, { error: 'method_not_allowed', allowed: methods })
  return false
}

export async function readJson(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body
  }

  const chunks = []
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk))
  }

  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

export function getQueryValue(req, key) {
  if (req.query && req.query[key]) {
    return Array.isArray(req.query[key]) ? req.query[key][0] : req.query[key]
  }

  const url = new URL(req.url, 'https://hookpilot.local')
  return url.searchParams.get(key)
}

export function requireServerEnv(keys) {
  return keys.filter((key) => !process.env[key])
}
