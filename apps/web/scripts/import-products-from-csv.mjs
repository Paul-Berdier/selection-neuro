#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const CSV_PATH = process.argv[2] ?? './products_export_1.csv'
const API_BASE = (process.env.SELECTION_NEURO_API_BASE ?? '').replace(/\/$/, '')
const ADMIN_EMAIL = process.env.SELECTION_NEURO_ADMIN_EMAIL ?? ''
const ADMIN_PASSWORD = process.env.SELECTION_NEURO_ADMIN_PASSWORD ?? ''
const DRY_RUN = (process.env.DRY_RUN ?? 'true').toLowerCase() !== 'false'

if (!API_BASE || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    'Variables requises: SELECTION_NEURO_API_BASE, SELECTION_NEURO_ADMIN_EMAIL, SELECTION_NEURO_ADMIN_PASSWORD',
  )
  process.exit(1)
}

function splitCsvLine(line) {
  const cells = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      cells.push(current)
      current = ''
      continue
    }

    current += char
  }

  cells.push(current)
  return cells
}

function parseCsv(content) {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean)
  const headers = splitCsvLine(lines[0])
  return lines.slice(1).map((line) => {
    const row = splitCsvLine(line)
    return headers.reduce((acc, header, index) => {
      acc[header] = row[index] ?? ''
      return acc
    }, {})
  })
}

function slugify(input) {
  return String(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function groupRows(rows) {
  const groups = new Map()
  for (const row of rows) {
    const handle = row.Handle?.trim()
    if (!handle) continue
    if (!groups.has(handle)) groups.set(handle, [])
    groups.get(handle).push(row)
  }
  return groups
}

function parseNumber(value) {
  if (value == null || value === '') return null
  const normalized = String(value).replace(',', '.').trim()
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function inferVariants(groupRows) {
  const variants = groupRows
    .map((row) => ({
      grams: parseNumber(row['Variant Grams'] || row['Unit Price Total Measure']),
      price: parseNumber(row['Variant Price']),
      option: row['Option1 Value']?.trim() || '',
    }))
    .filter((variant) => variant.grams != null || variant.price != null)
    .sort((a, b) => (a.grams ?? 0) - (b.grams ?? 0))

  return {
    price_1m: variants[0]?.price ?? null,
    qty_g_1m: variants[0]?.grams ?? null,
    price_3m: variants[1]?.price ?? null,
    qty_g_3m: variants[1]?.grams ?? null,
    price_1y: variants[2]?.price ?? null,
    qty_g_1y: variants[2]?.grams ?? null,
  }
}

async function login() {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })

  if (!response.ok) {
    throw new Error(`Login impossible: HTTP ${response.status}`)
  }

  const data = await response.json()
  return data.access_token
}

async function api(pathname, token, options = {}) {
  const response = await fetch(`${API_BASE}${pathname}`, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`${pathname} -> HTTP ${response.status}\n${text}`)
  }

  if (response.status === 204) return null
  return response.json()
}

async function downloadImage(url) {
  if (!url) return null
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Téléchargement image impossible: ${url}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  const extension = path.extname(new URL(url).pathname) || '.png'
  return { buffer, filename: `import${extension}` }
}

async function createProduct(product, token) {
  const form = new FormData()
  for (const [key, value] of Object.entries(product)) {
    if (value == null || value === '') continue
    form.append(key, String(value))
  }

  if (product.image_url_source) {
    const image = await downloadImage(product.image_url_source)
    if (image) {
      form.append('image', new Blob([image.buffer]), image.filename)
    }
  }

  form.delete('image_url_source')
  return api('/admin/products', token, { method: 'POST', body: form })
}

async function updateProduct(slug, product, token) {
  const form = new FormData()
  for (const [key, value] of Object.entries(product)) {
    if (value == null || value === '') continue
    form.append(key, String(value))
  }

  if (product.image_url_source) {
    const image = await downloadImage(product.image_url_source)
    if (image) {
      form.append('image', new Blob([image.buffer]), image.filename)
    }
  }

  form.delete('image_url_source')
  return api(`/admin/products/${slug}`, token, { method: 'PUT', body: form })
}

async function main() {
  const csvContent = await fs.readFile(CSV_PATH, 'utf8')
  const rows = parseCsv(csvContent)
  const groups = groupRows(rows)
  const token = await login()
  const existing = await api('/admin/products?limit=200', token)
  const existingItems = existing.items ?? existing

  for (const [handle, group] of groups.entries()) {
    const mainRow = group.find((row) => row.Title?.trim()) ?? group[0]
    const slug = slugify(handle)
    const newSlug = `${slug}-v2`
    const previous = existingItems.find((item) => item.slug === slug || item.slug === newSlug)
    const variants = inferVariants(group)

    const payload = {
      name: mainRow.Title?.trim() || handle,
      slug: previous ? newSlug : slug,
      short_desc: (mainRow.Tags || mainRow.Type || mainRow['SEO Description'] || '').trim(),
      description: (mainRow['Body (HTML)'] || '').trim(),
      category: (mainRow.Type || mainRow['Product Category'] || '').trim(),
      is_active: true,
      price_month_eur: variants.price_1m,
      image_url_source: (mainRow['Image Src'] || '').trim(),
      ...variants,
    }

    const operations = []

    if (previous?.slug === slug) {
      operations.push({ type: 'disable_previous', slug })
      operations.push({ type: 'create_new', slug: newSlug, payload })
    } else if (previous?.slug === newSlug) {
      operations.push({ type: 'update_existing_new', slug: newSlug, payload })
    } else {
      operations.push({ type: 'create_first', slug: payload.slug, payload })
    }

    console.log(`\n[${handle}]`)
    for (const op of operations) console.log(`- ${op.type}: ${op.slug}`)

    if (DRY_RUN) continue

    for (const op of operations) {
      if (op.type === 'disable_previous') {
        const disableForm = new FormData()
        disableForm.append('is_active', 'false')
        await api(`/admin/products/${op.slug}`, token, { method: 'PUT', body: disableForm })
      }
      if (op.type === 'create_new' || op.type === 'create_first') {
        await createProduct(op.payload, token)
      }
      if (op.type === 'update_existing_new') {
        await updateProduct(op.slug, op.payload, token)
      }
    }
  }

  console.log(`\nImport terminé. DRY_RUN=${DRY_RUN}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
