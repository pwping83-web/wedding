import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { DeliveryRecord, SaveDeliveryInput } from '../api/lib/deliveryStore'

const DATA_DIR = path.join(process.cwd(), '.data')
const DATA_FILE = path.join(DATA_DIR, 'cue-deliveries.json')

async function readRecords(): Promise<DeliveryRecord[]> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw) as DeliveryRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeRecords(records: DeliveryRecord[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf8')
}

export async function saveLocalDeliveryRecord(input: SaveDeliveryInput): Promise<DeliveryRecord> {
  const records = await readRecords()
  const record: DeliveryRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  }
  records.unshift(record)
  await writeRecords(records)
  return record
}

export async function listLocalDeliveryRecords(): Promise<DeliveryRecord[]> {
  return readRecords()
}

export async function getLocalDeliveryRecord(id: string): Promise<DeliveryRecord | null> {
  const records = await readRecords()
  return records.find((record) => record.id === id) ?? null
}
