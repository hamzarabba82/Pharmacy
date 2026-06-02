import { ref, onBeforeUnmount } from 'vue'

export function useDebouncedSearch<T>(
  searchFn: (query: string, signal?: AbortSignal) => Promise<T[]>,
  options?: { delay?: number },
) {
  const searchQuery = ref('')
  const searchResults = ref<T[]>([])
  const searching = ref(false)
  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  let abortController: AbortController | undefined
  const delay = options?.delay ?? 300

  function handleSearch() {
    clearTimeout(debounceTimer)
    abortController?.abort()
    if (!searchQuery.value.trim()) {
      searchResults.value = []
      return
    }
    searching.value = true
    debounceTimer = setTimeout(async () => {
      abortController = new AbortController()
      try {
        searchResults.value = await searchFn(searchQuery.value, abortController!.signal)
      } catch {
        searchResults.value = []
      } finally {
        searching.value = false
      }
    }, delay)
  }

  onBeforeUnmount(() => {
    clearTimeout(debounceTimer)
    abortController?.abort()
  })

  return { searchQuery, searchResults, searching, handleSearch }
}
