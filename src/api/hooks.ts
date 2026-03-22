/** 
 * ============================================================================ 
 * REACT HOOKS FOR BROWSER-ONLY API GATEWAY 
 * ============================================================================ 
 * Custom hooks for consuming the browser-only gateway 
 * Firebase + Gemini + localStorage caching 
 * ============================================================================ 
 */ 
 
import { useState, useEffect, useCallback, useRef } from 'react'; 
import { 
  getBrowserAPIGateway, 
  APIEndpoint, 
  APIRequest, 
  APIResponse, 
  ErrorCode, 
} from './gateway'; 
 
// ============================================================================ 
// TYPES 
// ============================================================================ 
 
export interface FetchState<T> { 
  data: T | null; 
  loading: boolean; 
  error: Error | null; 
  errorCode?: ErrorCode; 
  isSuccess: boolean; 
  requestId?: string; 
} 
 
export interface MutationState<T> extends FetchState<T> { 
  isMutating: boolean; 
  reset: () => void; 
} 
 
export interface UseQueryOptions { 
  enabled?: boolean; 
  refetchInterval?: number; 
  onSuccess?: (data: any) => void; 
  onError?: (error: any) => void; 
  useCache?: boolean; 
  cacheTTL?: number; 
} 
 
// ============================================================================ 
// QUERY HOOK - For GET requests 
// ============================================================================ 
 
export function useQuery<T = any>( 
  endpoint: APIEndpoint, 
  params?: Record<string, any>, 
  options?: UseQueryOptions 
) { 
  const [state, setState] = useState<FetchState<T>>({ 
    data: null, 
    loading: true, 
    error: null, 
    isSuccess: false, 
  }); 
 
  const refetchIntervalRef = useRef<ReturnType<typeof setInterval> | null>( 
    null 
  ); 
 
  const fetchData = useCallback(async () => { 
    if (options?.enabled === false) return; 
 
    setState((prev) => ({ ...prev, loading: true, error: null })); 
 
    try { 
      const gateway = getBrowserAPIGateway(); 
      const response = await gateway.get<T>(endpoint, params); 
 
      if (response.success && response.data !== undefined) { 
        setState({ 
          data: response.data, 
          loading: false, 
          error: null, 
          isSuccess: true, 
          requestId: response.requestId, 
        }); 
 
        options?.onSuccess?.(response.data); 
      } else { 
        const error = new Error( 
          response.error?.message || 'Failed to fetch data' 
        ); 
        setState({ 
          data: null, 
          loading: false, 
          error, 
          errorCode: response.error?.code as ErrorCode, 
          isSuccess: false, 
          requestId: response.requestId, 
        }); 
 
        options?.onError?.(error); 
      } 
    } catch (err) { 
      const error = err instanceof Error ? err : new Error(String(err)); 
      setState({ 
        data: null, 
        loading: false, 
        error, 
        isSuccess: false, 
      }); 
 
      options?.onError?.(error); 
    } 
  }, [endpoint, params, options]); 
 
  useEffect(() => { 
    fetchData(); 
 
    // Setup refetch interval if specified 
    if (options?.refetchInterval) { 
      refetchIntervalRef.current = setInterval( 
        fetchData, 
        options.refetchInterval 
      ); 
    } 
 
    return () => { 
      if (refetchIntervalRef.current) { 
        clearInterval(refetchIntervalRef.current); 
      } 
    }; 
  }, [fetchData, options?.refetchInterval]); 
 
  const refetch = useCallback(fetchData, [fetchData]); 
 
  return { 
    ...state, 
    refetch, 
  }; 
} 
 
// ============================================================================ 
// MUTATION HOOK - For POST/PUT/DELETE requests 
// ============================================================================ 
 
export function useMutation<T = any>( 
  method: 'POST' | 'PUT' | 'DELETE', 
  options?: { 
    onSuccess?: (data: any) => void; 
    onError?: (error: any) => void; 
    invalidateEndpoints?: APIEndpoint[]; // Clear cache for these endpoints 
  } 
) { 
  const [state, setState] = useState<MutationState<T>>({ 
    data: null, 
    loading: false, 
    error: null, 
    isSuccess: false, 
    isMutating: false, 
    reset: () => {}, 
  }); 
 
  const mutate = useCallback( 
    async ( 
      endpoint: APIEndpoint, 
      data?: any, 
      params?: Record<string, any> 
    ) => { 
      setState((prev) => ({ 
        ...prev, 
        loading: true, 
        isMutating: true, 
        error: null, 
      })); 
 
      try { 
        const gateway = getBrowserAPIGateway(); 
        let response: APIResponse<T>; 
 
        if (method === 'POST') { 
          response = await gateway.post<T>(endpoint, data, false); 
        } else if (method === 'PUT') { 
          response = await gateway.put<T>(endpoint, data); 
        } else { 
          response = await gateway.delete<T>(endpoint, params); 
        } 
 
        if (response.success && response.data !== undefined) { 
          setState({ 
            data: response.data, 
            loading: false, 
            error: null, 
            isSuccess: true, 
            isMutating: false, 
            requestId: response.requestId, 
            reset: () => {}, 
          }); 
 
          // Invalidate related caches 
          if (options?.invalidateEndpoints) { 
            options.invalidateEndpoints.forEach((ep) => { 
              gateway.clearCacheForEndpoint(ep); 
            }); 
          } 
 
          options?.onSuccess?.(response.data); 
        } else { 
          const error = new Error( 
            response.error?.message || 'Mutation failed' 
          ); 
          setState({ 
            data: null, 
            loading: false, 
            error, 
            errorCode: response.error?.code as ErrorCode, 
            isSuccess: false, 
            isMutating: false, 
            reset: () => {}, 
          }); 
 
          options?.onError?.(error); 
        } 
      } catch (err) { 
        const error = err instanceof Error ? err : new Error(String(err)); 
        setState({ 
          data: null, 
          loading: false, 
          error, 
          isSuccess: false, 
          isMutating: false, 
          reset: () => {}, 
        }); 
 
        options?.onError?.(error); 
      } 
    }, 
    [method, options] 
  ); 
 
  const reset = useCallback(() => { 
    setState({ 
      data: null, 
      loading: false, 
      error: null, 
      isSuccess: false, 
      isMutating: false, 
      reset, 
    }); 
  }, []); 
 
  return { 
    mutate, 
    ...state, 
    reset, 
  }; 
} 
 
// ============================================================================ 
// PAGINATED QUERY HOOK 
// ============================================================================ 
 
export function usePaginatedQuery<T = any>( 
  endpoint: APIEndpoint, 
  pageSize: number = 20, 
  options?: UseQueryOptions 
) { 
  const [page, setPage] = useState(1); 
  const [allData, setAllData] = useState<T[]>([]); 
 
  const { data, loading, error, refetch } = useQuery<{ 
    items: T[]; 
    total: number; 
    page: number; 
    pageSize: number; 
  }>( 
    endpoint, 
    { page, pageSize }, 
    options 
  ); 
 
  useEffect(() => { 
    if (data?.items) { 
      if (page === 1) { 
        setAllData(data.items); 
      } else { 
        setAllData((prev) => [...prev, ...data.items]); 
      } 
    } 
  }, [data, page]); 
 
  const hasNextPage = 
    data && data.page * data.pageSize < data.total; 
  const loadMore = useCallback(() => { 
    if (hasNextPage) { 
      setPage((prev) => prev + 1); 
    } 
  }, [hasNextPage]); 
 
  const reset = useCallback(() => { 
    setPage(1); 
    setAllData([]); 
  }, []); 
 
  return { 
    data: allData, 
    page, 
    pageSize, 
    totalCount: data?.total || 0, 
    loading, 
    error, 
    hasNextPage, 
    loadMore, 
    refetch, 
    reset, 
  }; 
} 
 
// ============================================================================ 
// INFINITE QUERY HOOK 
// ============================================================================ 
 
export function useInfiniteQuery<T = any>( 
  endpoint: APIEndpoint, 
  pageSize: number = 20, 
  options?: UseQueryOptions 
) { 
  const [pages, setPages] = useState<T[]>([]); 
  const [nextCursor, setNextCursor] = useState<string | null>(null); 
  const [hasMore, setHasMore] = useState(true); 
 
  const [state, setState] = useState<FetchState<T[]>>({ 
    data: pages, 
    loading: false, 
    error: null, 
    isSuccess: false, 
  }); 
 
  const fetchNextPage = useCallback(async () => { 
    setState((prev) => ({ ...prev, loading: true })); 
 
    try { 
      const gateway = getBrowserAPIGateway(); 
      const response = await gateway.get<{ 
        items: T[]; 
        nextCursor?: string; 
        hasMore: boolean; 
      }>(endpoint, { cursor: nextCursor, pageSize }); 
 
      if (response.success && response.data) { 
        setPages((prev) => [...prev, ...response.data.items]); 
        setNextCursor(response.data.nextCursor || null); 
        setHasMore(response.data.hasMore); 
 
        setState({ 
          data: pages, 
          loading: false, 
          error: null, 
          isSuccess: true, 
          requestId: response.requestId, 
        }); 
 
        options?.onSuccess?.(response.data); 
      } else { 
        throw new Error( 
          response.error?.message || 'Failed to fetch more' 
        ); 
      } 
    } catch (err) { 
      const error = err instanceof Error ? err : new Error(String(err)); 
      setState((prev) => ({ 
        ...prev, 
        loading: false, 
        error, 
      })); 
      options?.onError?.(error); 
    } 
  }, [endpoint, nextCursor, pageSize, pages, options]); 
 
  const reset = useCallback(() => { 
    setPages([]); 
    setNextCursor(null); 
    setHasMore(true); 
  }, []); 
 
  return { 
    data: state.data, 
    loading: state.loading, 
    error: state.error, 
    isSuccess: state.isSuccess, 
    hasMore, 
    fetchNextPage, 
    reset, 
  }; 
} 
 
// ============================================================================ 
// OPTIMISTIC UPDATE HOOK 
// ============================================================================ 
 
export function useOptimisticMutation<T = any>( 
  method: 'POST' | 'PUT' | 'DELETE', 
  queryEndpoint?: APIEndpoint, 
  options?: { 
    onSuccess?: (data: any) => void; 
    onError?: (error: any) => void; 
  } 
) { 
  const [cachedData, setCachedData] = useState<T | null>(null); 
  const [state, setState] = useState<MutationState<T>>({ 
    data: null, 
    loading: false, 
    error: null, 
    isSuccess: false, 
    isMutating: false, 
    reset: () => {}, 
  }); 
 
  const mutate = useCallback( 
    async ( 
      endpoint: APIEndpoint, 
      data: any, 
      optimisticData?: T 
    ) => { 
      // Store original data for rollback 
      setCachedData(state.data); 
 
      // Optimistically update UI 
      if (optimisticData) { 
        setState((prev) => ({ 
          ...prev, 
          data: optimisticData, 
          loading: true, 
          isMutating: true, 
          error: null, 
        })); 
      } 
 
      try { 
        const gateway = getBrowserAPIGateway(); 
        let response: APIResponse<T>; 
 
        if (method === 'POST') { 
          response = await gateway.post<T>(endpoint, data); 
        } else if (method === 'PUT') { 
          response = await gateway.put<T>(endpoint, data); 
        } else { 
          response = await gateway.delete<T>(endpoint, data?.params); 
        } 
 
        if (response.success && response.data !== undefined) { 
          setState({ 
            data: response.data, 
            loading: false, 
            error: null, 
            isSuccess: true, 
            isMutating: false, 
            requestId: response.requestId, 
            reset: () => {}, 
          }); 
 
          // Clear related query cache 
          if (queryEndpoint) { 
            gateway.clearCacheForEndpoint(queryEndpoint); 
          } 
 
          options?.onSuccess?.(response.data); 
        } else { 
          throw new Error( 
            response.error?.message || 'Mutation failed' 
          ); 
        } 
      } catch (err) { 
        const error = err instanceof Error ? err : new Error(String(err)); 
 
        // Rollback to original data 
        setState({ 
          data: cachedData, 
          loading: false, 
          error, 
          isSuccess: false, 
          isMutating: false, 
          reset: () => {}, 
        }); 
 
        options?.onError?.(error); 
      } 
    }, 
    [state.data, cachedData, method, queryEndpoint, options] 
  ); 
 
  const reset = useCallback(() => { 
    setState({ 
      data: null, 
      loading: false, 
      error: null, 
      isSuccess: false, 
      isMutating: false, 
      reset, 
    }); 
  }, []); 
 
  return { 
    mutate, 
    ...state, 
    reset, 
  }; 
} 
 
// ============================================================================ 
// BATCH QUERY HOOK 
// ============================================================================ 
 
export function useBatchQueries<T = any>( 
  requests: APIRequest[], 
  options?: UseQueryOptions 
) { 
  const [state, setState] = useState< 
    FetchState<APIResponse[]> 
  >({ 
    data: null, 
    loading: true, 
    error: null, 
    isSuccess: false, 
  }); 
 
  const fetchData = useCallback(async () => { 
    setState((prev) => ({ ...prev, loading: true })); 
 
    try { 
      const gateway = getBrowserAPIGateway(); 
      const results = await Promise.all( 
        requests.map((req) => gateway.request(req)) 
      ); 
 
      setState({ 
        data: results, 
        loading: false, 
        error: null, 
        isSuccess: results.every((r) => r.success), 
      }); 
 
      options?.onSuccess?.(results); 
    } catch (err) { 
      const error = err instanceof Error ? err : new Error(String(err)); 
      setState({ 
        data: null, 
        loading: false, 
        error, 
        isSuccess: false, 
      }); 
 
      options?.onError?.(error); 
    } 
  }, [requests, options]); 
 
  useEffect(() => { 
    fetchData(); 
  }, [fetchData]); 
 
  return { 
    ...state, 
    refetch: fetchData, 
  }; 
} 
 
// ============================================================================ 
// EXPORT 
// ============================================================================ 
 
export default { 
  useQuery, 
  useMutation, 
  usePaginatedQuery, 
  useInfiniteQuery, 
  useOptimisticMutation, 
  useBatchQueries, 
}; 
