import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

import client from '../../api/client'
import { getMedicines, getMedicine, createMedicine, updateMedicine, getBatches } from '../../api/medicines'

describe('medicines API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getMedicines يرسل GET إلى /medicines', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { data: [], total: 0 } })
    const result = await getMedicines()
    expect(client.get).toHaveBeenCalledWith('/medicines', expect.objectContaining({}))
    expect(result).toEqual({ data: [], total: 0 })
  })

  it('getMedicine يرسل GET إلى /medicines/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: 1, name: 'Test' } })
    const result = await getMedicine(1)
    expect(client.get).toHaveBeenCalledWith('/medicines/1')
    expect(result).toEqual({ id: 1, name: 'Test' })
  })

  it('createMedicine يرسل POST إلى /medicines', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: { id: 1 } })
    const result = await createMedicine({ name: 'New' })
    expect(client.post).toHaveBeenCalledWith('/medicines', { name: 'New' })
    expect(result).toEqual({ id: 1 })
  })

  it('updateMedicine يرسل PUT إلى /medicines/:id', async () => {
    vi.mocked(client.put).mockResolvedValue({ data: { id: 1, name: 'Updated' } })
    const result = await updateMedicine(1, { name: 'Updated' })
    expect(client.put).toHaveBeenCalledWith('/medicines/1', { name: 'Updated' })
    expect(result).toEqual({ id: 1, name: 'Updated' })
  })

  it('getBatches يرسل GET إلى /medicines/:id/batches', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [{ id: 1 }] })
    const result = await getBatches(1)
    expect(client.get).toHaveBeenCalledWith('/medicines/1/batches')
    expect(result).toEqual([{ id: 1 }])
  })
})
