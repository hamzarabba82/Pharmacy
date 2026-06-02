import client from './client'

export async function getSettings(): Promise<Record<string, string>> {
  const { data } = await client.get('/settings')
  return data
}

export async function updateSettings(settings: Record<string, string>): Promise<void> {
  await client.put('/settings', settings)
}
