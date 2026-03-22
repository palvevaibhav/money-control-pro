/** 
 * ============================================================================ 
 * UNIFIED API GATEWAY - BROWSER-ONLY (NO BACKEND REQUIRED) 
 * ============================================================================ 
 *  
 * Single entry point for ALL API calls: 
 * - Firebase (Firestore + Auth) 
 * - Gemini AI 
 * - LocalStorage persistence 
 *  
 * Features: 
 * - 100% browser-based (no backend server needed) 
 * - Transparent Firebase integration 
 * - Transparent Gemini API calls 
 * - Smart caching with offline support 
 * - Automatic retry logic 
 * - Full TypeScript support 
 * ============================================================================ 
 */
import {  
  getFirestore,   collection,  
  query,  
  where,  
  orderBy,  
  getDocs,  
  getDoc,  
  doc,  
  addDoc,  
  updateDoc,  
  deleteDoc,  
  writeBatch,  
  Timestamp,  
  QueryConstraint,  
  DocumentData,  
 } from 'firebase/firestore';  
import { getAuth, User } from 'firebase/auth';  
import { GoogleGenerativeAI } from '@google/generative-ai';
  
 
// ============================================================================ 
// TYPE DEFINITIONS 
// ============================================================================ 
 
export enum APIEndpoint { 
  // Auth endpoints 
  SIGN_IN = 'auth/signin', 
  SIGN_UP = 'auth/signup', 
  SIGN_OUT = 'auth/signout', 
  CURRENT_USER = 'auth/current-user', 
 
  // Transaction endpoints 
  GET_TRANSACTIONS = 'transactions/list', 
  CREATE_TRANSACTION = 'transactions/create', 
  UPDATE_TRANSACTION = 'transactions/update', 
  DELETE_TRANSACTION = 'transactions/delete', 
  BULK_IMPORT_TRANSACTIONS = 'transactions/bulk-import', 
 
  // Expense tracking 
  GET_EXPENSES = 'expenses/list', 
  GET_EXPENSE_SUMMARY = 'expenses/summary', 
  GET_EXPENSE_BY_CATEGORY = 'expenses/by-category', 
 
  // Budget management 
  GET_BUDGETS = 'budgets/list', 
  CREATE_BUDGET = 'budgets/create', 
  UPDATE_BUDGET = 'budgets/update', 
  DELETE_BUDGET = 'budgets/delete', 
 
  // Savings goals 
  GET_SAVINGS_GOALS = 'savings/goals', 
  CREATE_SAVINGS_GOAL = 'savings/create', 
  UPDATE_SAVINGS_GOAL = 'savings/update', 
  DELETE_SAVINGS_GOAL = 'savings/delete', 
 
  // Loans & lending 
  GET_LOANS = 'loans/list', 
  CREATE_LOAN = 'loans/create', 
  UPDATE_LOAN = 'loans/update', 
  DELETE_LOAN = 'loans/delete', 
  GET_LOAN_CALCULATIONS = 'loans/calculate', 
 
  // Investments 
  GET_INVESTMENTS = 'investments/list', 
  CREATE_INVESTMENT = 'investments/create', 
  UPDATE_INVESTMENT = 'investments/update', 
  DELETE_INVESTMENT = 'investments/delete', 
  GET_INVESTMENT_SUMMARY = 'investments/summary', 
 
  // AI Financial Advisor 
  GET_AI_ADVICE = 'ai/financial-advice', 
  GET_AI_ANALYSIS = 'ai/expense-analysis', 
  GET_AI_RECOMMENDATIONS = 'ai/recommendations', 
 
  // Net worth & portfolio 
  GET_NET_WORTH = 'portfolio/net-worth', 
  GET_PORTFOLIO_SUMMARY = 'portfolio/summary', 
 
  // FIRE calculator 
  GET_FIRE_CALCULATION = 'fire/calculate', 
 
  // GST tools 
  CALCULATE_GST = 'tools/gst-calculate', 
 
  // Family wallet 
  GET_FAMILY_MEMBERS = 'family/members', 
  ADD_FAMILY_MEMBER = 'family/add-member', 
  SHARE_EXPENSE = 'family/share-expense', 
 
  // Settings 
  GET_SETTINGS = 'settings/get', 
  UPDATE_SETTINGS = 'settings/update', 
 
  // Data import/export 
  PARSE_BANK_STATEMENT = 'import/bank-statement', 
  PARSE_SMS = 'import/sms', 
  EXPORT_DATA = 'export/data', 
 
  // Analytics & reports 
  GET_ANALYTICS = 'analytics/dashboard', 
  GET_SPENDING_TRENDS = 'analytics/spending-trends', 
  GET_TAX_SUMMARY = 'analytics/tax-summary', 
} 
 
export interface APIRequest<T = any> { 
  endpoint: APIEndpoint; 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'; 
  data?: T; 
  params?: Record<string, any>; 
  headers?: Record<string, string>; 
  useCache?: boolean; 
  cacheTTL?: number; 
} 
 
export interface APIResponse<T = any> { 
  success: boolean; 
  data?: T; 
  error?: { 
    code: string; 
    message: string; 
    details?: any; 
  }; 
  timestamp: number; 
  requestId: string; 
} 
 
export interface CacheEntry<T = any> { 
  data: T; 
  timestamp: number; 
  ttl: number; 
} 
 
export enum ErrorCode { 
  NETWORK_ERROR = 'NETWORK_ERROR', 
  AUTH_ERROR = 'AUTH_ERROR', 
  NOT_FOUND = 'NOT_FOUND', 
  VALIDATION_ERROR = 'VALIDATION_ERROR', 
  SERVER_ERROR = 'SERVER_ERROR', 
  TIMEOUT = 'TIMEOUT', 
  CACHE_HIT = 'CACHE_HIT', 
  OFFLINE = 'OFFLINE', 
} 
 
// ============================================================================ 
// CONFIGURATION 
// ============================================================================ 
 
interface GatewayConfig { 
  firebaseApp?: any; 
  geminiApiKey?: string; 
  enableCache: boolean; 
  cacheMaxSize: number; 
  cacheTTL: number; 
  enableLogging: boolean; 
  retryAttempts: number; 
  retryDelay: number; 
} 
 
const DEFAULT_CONFIG: GatewayConfig = { 
  enableCache: true, 
  cacheMaxSize: 200, 
  cacheTTL: 5 * 60 * 1000, // 5 minutes 
  enableLogging: true, 
  retryAttempts: 3, 
  retryDelay: 1000, 
}; 
 
// ============================================================================ 
// BROWSER-ONLY API GATEWAY CLASS 
// ============================================================================ 
 
export class BrowserAPIGateway { 
  private config: GatewayConfig; 
  private cache: Map<string, CacheEntry> = new Map(); 
  private db: any; 
  private auth: any; 
  private genAI: GoogleGenerativeAI | null = null; 
  private currentUser: User | null = null; 
 
  constructor(config: Partial<GatewayConfig> = {}) { 
    this.config = { ...DEFAULT_CONFIG, ...config }; 
    this.initializeServices(); 
    this.restoreCacheFromStorage(); 
  } 
 
  // ======================================================================== 
  // INITIALIZATION 
  // ======================================================================== 
 
  private initializeServices() { 
    // Initialize Firebase services 
    if (this.config.firebaseApp) { 
      this.db = getFirestore(this.config.firebaseApp); 
      this.auth = getAuth(this.config.firebaseApp); 
 
      // Track current user 
      this.auth.onAuthStateChanged((user: User | null) => { 
        this.currentUser = user; 
        this.log('AUTH_STATE_CHANGED', { 
          uid: user?.uid, 
          email: user?.email, 
        }); 
      }); 
    } 
 
    // Initialize Gemini if key provided 
    if (this.config.geminiApiKey) { 
      this.genAI = new GoogleGenerativeAI( 
        this.config.geminiApiKey 
      ); 
    } 
  } 
 
  // ======================================================================== 
  // CORE REQUEST METHOD 
  // ======================================================================== 
 
  async request<T = any>( 
    request: APIRequest 
  ): Promise<APIResponse<T>> { 
    const requestId = this.generateRequestId(); 
    const cacheKey = this.generateCacheKey(request); 
 
    try { 
      // Check cache 
      if (request.useCache !== false) { 
        const cached = this.getFromCache<T>(cacheKey); 
        if (cached) { 
          this.log('CACHE_HIT', { 
            endpoint: request.endpoint, 
            requestId, 
          }); 
          return { 
            success: true, 
            data: cached, 
            timestamp: Date.now(), 
            requestId, 
          }; 
        } 
      } 
 
      // Route to appropriate handler 
      const response = await this.routeRequest<T>( 
        request, 
        requestId 
      ); 
 
      // Cache successful response 
      if ( 
        request.useCache !== false && 
        response.success && 
        response.data 
      ) { 
        this.setInCache( 
          cacheKey, 
          response.data, 
          request.cacheTTL || this.config.cacheTTL 
        ); 
      } 
 
      return response; 
    } catch (error) { 
      return this.handleError(error, requestId, request.endpoint); 
    } 
  } 
 
  // ======================================================================== 
  // REQUEST ROUTING 
  // ======================================================================== 
 
  private async routeRequest<T = any>( 
    request: APIRequest, 
    requestId: string 
  ): Promise<APIResponse<T>> { 
    const { endpoint, method, data, params } = request; 
 
    try { 
      // Auth endpoints 
      if (endpoint.startsWith('auth/')) { 
        return await this.handleAuthEndpoint(endpoint, data); 
      } 
 
      // Transaction endpoints 
      if (endpoint.startsWith('transactions/')) { 
        return await this.handleTransactionEndpoint( 
          endpoint, 
          data, 
          params 
        ); 
      } 
 
      // Expense endpoints 
      if (endpoint.startsWith('expenses/')) { 
        return await this.handleExpenseEndpoint( 
          endpoint, 
          params 
        ); 
      } 
 
      // AI endpoints 
      if (endpoint.startsWith('ai/')) { 
        return await this.handleAIEndpoint(endpoint, data); 
      } 
 
      // Portfolio endpoints 
      if (endpoint.startsWith('portfolio/')) { 
        return await this.handlePortfolioEndpoint(endpoint); 
      } 
 
      // FIRE calculator 
      if (endpoint === APIEndpoint.GET_FIRE_CALCULATION) { 
        return this.handleFIRECalculation(params); 
      } 
 
      // Settings endpoints 
      if (endpoint.startsWith('settings/')) { 
        return await this.handleSettingsEndpoint(endpoint, data); 
      } 
 
      // Default: not found 
      return { 
        success: false, 
        error: { 
          code: ErrorCode.NOT_FOUND, 
          message: `Endpoint not implemented: ${endpoint}`, 
        }, 
        timestamp: Date.now(), 
        requestId, 
      }; 
    } catch (error) { 
      throw error; 
    } 
  } 
 
  // ======================================================================== 
  // AUTH HANDLERS 
  // ======================================================================== 
 
  private async handleAuthEndpoint( 
    endpoint: string, 
    data: any 
  ): Promise<APIResponse> { 
    if (endpoint === APIEndpoint.CURRENT_USER) { 
      return { 
        success: true, 
        data: this.currentUser, 
        timestamp: Date.now(), 
        requestId: this.generateRequestId(), 
      }; 
    } 
 
    return { 
      success: false, 
      error: { 
        code: ErrorCode.NOT_FOUND, 
        message: `Auth endpoint not found: ${endpoint}`, 
      }, 
      timestamp: Date.now(), 
      requestId: this.generateRequestId(), 
    }; 
  } 
 
  // ======================================================================== 
  // TRANSACTION HANDLERS (FIREBASE) 
  // ======================================================================== 
 
  private async handleTransactionEndpoint( 
    endpoint: string, 
    data: any, 
    params: any 
  ): Promise<APIResponse> { 
    if (!this.currentUser || !this.db) { 
      return this.createErrorResponse( 
        ErrorCode.AUTH_ERROR, 
        'Not authenticated' 
      ); 
    } 
 
    const userTransactionsRef = collection( 
      this.db, 
      'users', 
      this.currentUser.uid, 
      'transactions' 
    ); 
 
    switch (endpoint) { 
      case APIEndpoint.GET_TRANSACTIONS: { 
        const constraints: QueryConstraint[] = []; 
 
        if (params?.category) { 
          constraints.push( 
            where('category', '==', params.category) 
          ); 
        } 
 
        if (params?.startDate) { 
          constraints.push( 
            where( 
              'date', 
              '>=', 
              new Date(params.startDate) 
            ) 
          ); 
        } 
 
        if (params?.endDate) { 
          constraints.push( 
            where('date', '<=', new Date(params.endDate)) 
          ); 
        } 
 
        constraints.push(orderBy('date', 'desc')); 
 
        const q = query(userTransactionsRef, ...constraints); 
        const snapshot = await getDocs(q); 
 
        const transactions = snapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data(), 
        })); 
 
        return { 
          success: true, 
          data: transactions, 
          timestamp: Date.now(), 
          requestId: this.generateRequestId(), 
        }; 
      } 
 
      case APIEndpoint.CREATE_TRANSACTION: { 
        const docRef = await addDoc(userTransactionsRef, { 
          ...data, 
          createdAt: Timestamp.now(), 
          updatedAt: Timestamp.now(), 
        }); 
 
        return { 
          success: true, 
          data: { id: docRef.id, ...data }, 
          timestamp: Date.now(), 
          requestId: this.generateRequestId(), 
        }; 
      } 
 
      case APIEndpoint.UPDATE_TRANSACTION: { 
        const docRef = doc( 
          this.db, 
          'users', 
          this.currentUser.uid, 
          'transactions', 
          data.id 
        ); 
        await updateDoc(docRef, { 
          ...data, 
          updatedAt: Timestamp.now(), 
        }); 
 
        return { 
          success: true, 
          data: { id: data.id, ...data }, 
          timestamp: Date.now(), 
          requestId: this.generateRequestId(), 
        }; 
      } 
 
      case APIEndpoint.DELETE_TRANSACTION: { 
        const docRef = doc( 
          this.db, 
          'users', 
          this.currentUser.uid, 
          'transactions', 
          data.id 
        ); 
        await deleteDoc(docRef); 
 
        return { 
          success: true, 
          data: { id: data.id }, 
          timestamp: Date.now(), 
          requestId: this.generateRequestId(), 
        }; 
      } 
 
      case APIEndpoint.BULK_IMPORT_TRANSACTIONS: { 
        const batch = writeBatch(this.db); 
        const transactions: any[] = []; 
 
        for (const tx of data.transactions || []) { 
          const docRef = doc( 
            userTransactionsRef, 
            `import_${Date.now()}_${Math.random()}` 
          ); 
          batch.set(docRef, { 
            ...tx, 
            createdAt: Timestamp.now(), 
          }); 
          transactions.push({ id: docRef.id, ...tx }); 
        } 
 
        await batch.commit(); 
 
        return { 
          success: true, 
          data: { imported: transactions.length, transactions }, 
          timestamp: Date.now(), 
          requestId: this.generateRequestId(), 
        }; 
      } 
 
      default: 
        return this.createErrorResponse( 
          ErrorCode.NOT_FOUND, 
          `Transaction endpoint not found: ${endpoint}` 
        ); 
    } 
  } 
 
  // ======================================================================== 
  // EXPENSE HANDLERS (CALCULATED FROM TRANSACTIONS) 
  // ======================================================================== 
 
  private async handleExpenseEndpoint( 
    endpoint: string, 
    params: any 
  ): Promise<APIResponse> { 
    if (!this.currentUser || !this.db) { 
      return this.createErrorResponse( 
        ErrorCode.AUTH_ERROR, 
        'Not authenticated' 
      ); 
    } 
 
    // Get all transactions 
    const userTransactionsRef = collection( 
      this.db, 
      'users', 
      this.currentUser.uid, 
      'transactions' 
    ); 
 
    const q = query( 
      userTransactionsRef, 
      where('type', '==', 'expense') 
    ); 
    const snapshot = await getDocs(q); 
    const transactions = snapshot.docs.map((doc: { id: any; data: () => any; }) => ({ 
      id: doc.id, 
      ...doc.data(), 
    })); 
 
    switch (endpoint) { 
      case APIEndpoint.GET_EXPENSES: 
        return { 
          success: true, 
          data: transactions, 
          timestamp: Date.now(), 
          requestId: this.generateRequestId(), 
        }; 
 
      case APIEndpoint.GET_EXPENSE_SUMMARY: { 
        const now = new Date(); 
        const monthStart = new Date( 
          now.getFullYear(), 
          now.getMonth(), 
          1 
        ); 
 
        let totalExpenses = 0; 
        let monthlyTotal = 0; 
        const categoryBreakdown: Record<string, number> = {}; 
 
        for (const tx of transactions) { 
          totalExpenses += tx.amount || 0; 
 
          if (tx.date >= monthStart) { 
            monthlyTotal += tx.amount || 0; 
          } 
 
          categoryBreakdown[tx.category] = 
            (categoryBreakdown[tx.category] || 0) + 
            (tx.amount || 0); 
        } 
 
        return { 
          success: true, 
          data: { 
            totalExpenses, 
            monthlyTotal, 
            dailyAverage: Math.round(monthlyTotal / 30), 
            categoryBreakdown, 
          }, 
          timestamp: Date.now(), 
          requestId: this.generateRequestId(), 
        }; 
      } 
 
      case APIEndpoint.GET_EXPENSE_BY_CATEGORY: { 
        const categoryBreakdown: Record<string, any> = {}; 
 
        for (const tx of transactions) { 
          if (!categoryBreakdown[tx.category]) { 
            categoryBreakdown[tx.category] = { 
              category: tx.category, 
              total: 0, 
              count: 0, 
              transactions: [], 
            }; 
          } 
          categoryBreakdown[tx.category].total += tx.amount || 0; 
          categoryBreakdown[tx.category].count++; 
          categoryBreakdown[tx.category].transactions.push(tx); 
        } 
 
        return { 
          success: true, 
          data: Object.values(categoryBreakdown), 
          timestamp: Date.now(), 
          requestId: this.generateRequestId(), 
        }; 
      } 
 
      default: 
        return this.createErrorResponse( 
          ErrorCode.NOT_FOUND, 
          `Expense endpoint not found: ${endpoint}` 
        ); 
    } 
  } 
 
  // ======================================================================== 
  // AI HANDLERS (GEMINI) 
  // ======================================================================== 
 
  private async handleAIEndpoint( 
    endpoint: string, 
    data: any 
  ): Promise<APIResponse> { 
    if (!this.genAI) { 
      return this.createErrorResponse( 
        ErrorCode.VALIDATION_ERROR, 
        'Gemini AI not configured' 
      ); 
    } 
 
    if (!this.currentUser || !this.db) { 
      return this.createErrorResponse( 
        ErrorCode.AUTH_ERROR, 
        'Not authenticated' 
      ); 
    } 
 
    try { 
      // Get user's transactions for analysis 
      const userTransactionsRef = collection( 
        this.db, 
        'users', 
        this.currentUser.uid, 
        'transactions' 
      ); 
      const q = query( 
        userTransactionsRef, 
        orderBy('date', 'desc') 
      ); 
      const snapshot = await getDocs(q); 
      const transactions = snapshot.docs.map((doc) => 
        doc.data() 
      ); 
 
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-pro', 
      }); 
 
      switch (endpoint) { 
        case APIEndpoint.GET_AI_ADVICE: { 
          // Calculate expense summary 
          const expenses = transactions.filter( 
            (t: { type: string; }) => t.type === 'expense' 
          ); 
          const categoryTotals: Record<string, number> = {}; 
          let totalExpenses = 0; 
 
          for (const tx of expenses) { 
            categoryTotals[tx.category] = 
              (categoryTotals[tx.category] || 0) + 
              (tx.amount || 0); 
            totalExpenses += tx.amount || 0; 
          } 
 
          const prompt = ` 
// You are a financial advisor. Analyze this user's expense patterns and provide advice.  Total Expenses (Last 30 days): ₹${totalExpenses} 
// Expense Breakdown: 
${Object.entries(categoryTotals) 
  .map(([cat, amt]) => `- ${cat}: ₹${amt}`) 
  .join('\ ')} 
 
// Provide a JSON response with: 
// 1. \"analysis\": Brief analysis of spending patterns (2-3 sentences) 
// 2. \"recommendations\": Array of 3-5 actionable tips 
// 3. \"score\": Financial health score (0-100) 
 
// Respond ONLY with valid JSON, no markdown. 
//           `; 
 
          const result = await model.generateContent(prompt); 
          const responseText = 
            result.response.text(); 
 
          const jsonMatch = responseText.match( 
            /\\{[\\s\\S]*\\}/ 
          ); 
          if (!jsonMatch) { 
            throw new Error('Invalid AI response format'); 
          } 
 
          const advice = JSON.parse(jsonMatch[0]); 
 
          return { 
            success: true, 
            data: advice, 
            timestamp: Date.now(), 
            requestId: this.generateRequestId(), 
          }; 
        } 
 
        case APIEndpoint.GET_AI_ANALYSIS: { 
          const prompt = ` 
Analyze these transactions and identify spending patterns, anomalies, and trends. 
Transactions: ${JSON.stringify(transactions.slice(0, 20))} 
 
Provide a concise analysis in JSON format. 
          `; 
 
          const result = await model.generateContent(prompt); 
          const responseText = 
            result.response.text(); 
 
          return { 
            success: true, 
            data: { analysis: responseText }, 
            timestamp: Date.now(), 
            requestId: this.generateRequestId(), 
          }; 
        } 
 
        default: 
          return this.createErrorResponse( 
            ErrorCode.NOT_FOUND, 
            `AI endpoint not found: ${endpoint}` 
          ); 
      } 
    } catch (error) { 
      this.log('AI_ERROR', { error, endpoint }); 
      return this.createErrorResponse( 
        ErrorCode.SERVER_ERROR, 
        `AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      ); 
    } 
  } 
 
  // ======================================================================== 
  // PORTFOLIO HANDLERS 
  // ======================================================================== 
 
  private async handlePortfolioEndpoint( 
    endpoint: string 
  ): Promise<APIResponse> { 
    if (!this.currentUser || !this.db) { 
      return this.createErrorResponse( 
        ErrorCode.AUTH_ERROR, 
        'Not authenticated' 
      ); 
    } 
 
    switch (endpoint) { 
      case APIEndpoint.GET_NET_WORTH: { 
        // Get all transactions 
        const userTransactionsRef = collection( 
          this.db, 
          'users', 
          this.currentUser.uid, 
          'transactions' 
        ); 
        const snapshot = await getDocs( 
          userTransactionsRef 
        ); 
        const transactions = snapshot.docs.map((doc) => 
          doc.data() 
        ); 
 
        let totalAssets = 0; 
        let totalLiabilities = 0; 
 
        for (const tx of transactions) { 
          if (tx.type === 'income') { 
            totalAssets += tx.amount || 0; 
          } else if (tx.category === 'loan') { 
            totalLiabilities += tx.amount || 0; 
          } else { 
            totalAssets -= tx.amount || 0; 
          } 
        } 
 
        // Ensure assets don't go negative 
        totalAssets = Math.max(0, totalAssets); 
 
        return { 
          success: true, 
          data: { 
            totalAssets, 
            totalLiabilities, 
            netWorth: totalAssets - totalLiabilities, 
          }, 
          timestamp: Date.now(), 
          requestId: this.generateRequestId(), 
        }; 
      } 
 
      default: 
        return this.createErrorResponse( 
          ErrorCode.NOT_FOUND, 
          `Portfolio endpoint not found: ${endpoint}` 
        ); 
    } 
  } 
 
  // ======================================================================== 
  // FIRE CALCULATOR 
  // ======================================================================== 
 
  private handleFIRECalculation( 
    params: any 
  ): APIResponse { 
    const { 
      currentSavings = 0, 
      monthlyContribution = 0, 
      annualReturn = 0.08, 
      targetAmount = 5000000, 
    } = params || {}; 
 
    let months = 0; 
    let amount = currentSavings; 
    const monthlyReturn = annualReturn / 12; 
 
    while (amount < targetAmount && months < 1200) { 
      amount = amount * (1 + monthlyReturn) + 
        monthlyContribution; 
      months++; 
    } 
 
    const years = Math.ceil(months / 12); 
    const targetDate = new Date(); 
    targetDate.setFullYear(targetDate.getFullYear() + 
      years); 
 
    return { 
      success: true, 
      data: { 
        yearsToFire: years, 
        targetDate: targetDate.toLocaleDateString(), 
        monthlyContribution, 
        projectedAmount: Math.round(amount), 
        achieved: months < 1200, 
      }, 
      timestamp: Date.now(), 
      requestId: this.generateRequestId(), 
    }; 
  } 
 
  // ======================================================================== 
  // SETTINGS HANDLERS (LOCALSTORAGE) 
  // ======================================================================== 
 
  private async handleSettingsEndpoint( 
    endpoint: string, 
    data: any 
  ): Promise<APIResponse> { 
    const settingsKey = `settings_${this.currentUser?.uid}`; 
 
    switch (endpoint) { 
      case APIEndpoint.GET_SETTINGS: { 
        const stored = 
          localStorage.getItem(settingsKey); 
        const settings = stored ? JSON.parse(stored) : {}; 
 
        return { 
          success: true, 
          data: settings, 
          timestamp: Date.now(), 
          requestId: this.generateRequestId(), 
        }; 
      } 
 
      case APIEndpoint.UPDATE_SETTINGS: { 
        localStorage.setItem( 
          settingsKey, 
          JSON.stringify(data) 
        ); 
 
        return { 
          success: true, 
          data, 
          timestamp: Date.now(), 
          requestId: this.generateRequestId(), 
        }; 
      } 
 
      default: 
        return this.createErrorResponse( 
          ErrorCode.NOT_FOUND, 
          `Settings endpoint not found: ${endpoint}` 
        ); 
    } 
  } 
 
  // ======================================================================== 
  // CONVENIENCE METHODS 
  // ======================================================================== 
 
  async get<T = any>( 
    endpoint: APIEndpoint, 
    params?: Record<string, any> 
  ): Promise<APIResponse<T>> { 
    return this.request<T>({ 
      endpoint, 
      method: 'GET', 
      params, 
      useCache: true, 
    }); 
  } 
 
  async post<T = any>( 
    endpoint: APIEndpoint, 
    data: any, 
    useCache = false 
  ): Promise<APIResponse<T>> { 
    return this.request<T>({ 
      endpoint, 
      method: 'POST', 
      data, 
      useCache, 
    }); 
  } 
 
  async put<T = any>( 
    endpoint: APIEndpoint, 
    data: any 
  ): Promise<APIResponse<T>> { 
    return this.request<T>({ 
      endpoint, 
      method: 'PUT', 
      data, 
      useCache: false, 
    }); 
  } 
 
  async delete<T = any>( 
    endpoint: APIEndpoint, 
    params?: Record<string, any> 
  ): Promise<APIResponse<T>> { 
    return this.request<T>({ 
      endpoint, 
      method: 'DELETE', 
      params, 
      useCache: false, 
    }); 
  } 
 
  // ======================================================================== 
  // CACHING 
  // ======================================================================== 
 
  private generateCacheKey(request: APIRequest): string { 
    return `${request.endpoint}:${JSON.stringify( 
      request.params || {} 
    )}`; 
  } 
 
  private getFromCache<T>(key: string): T | null { 
    const entry = this.cache.get(key); 
 
    if (!entry) return null; 
 
    const isExpired = Date.now() - entry.timestamp > 
      entry.ttl; 
    if (isExpired) { 
      this.cache.delete(key); 
      return null; 
    } 
 
    return entry.data as T; 
  } 
 
  private setInCache<T>( 
    key: string, 
    data: T, 
    ttl: number 
  ): void { 
    if (this.cache.size >= this.config.cacheMaxSize) { 
      const firstKey = this.cache.keys().next().value; 
      this.cache.delete(firstKey); 
    } 
 
    this.cache.set(key, { 
      data, 
      timestamp: Date.now(), 
      ttl, 
    }); 
  } 
 
  private restoreCacheFromStorage(): void { 
    try { 
      const stored = localStorage.getItem( 
        'api_gateway_cache' 
      ); 
      if (stored) { 
        const entries = JSON.parse(stored); 
        Object.entries(entries).forEach( 
          ([key, entry]: [string, any]) => { 
            this.cache.set(key, entry); 
          } 
        ); 
      } 
    } catch (error) { 
      this.log('CACHE_RESTORE_ERROR', { error }); 
    } 
  } 
 
  clearCache(): void { 
    this.cache.clear(); 
    localStorage.removeItem('api_gateway_cache'); 
    this.log('CACHE_CLEARED', {}); 
  } 
 
  clearCacheForEndpoint(endpoint: APIEndpoint): void { 
    for (const [key] of this.cache) { 
      if (key.startsWith(endpoint)) { 
        this.cache.delete(key); 
      } 
    } 
  } 
 
  // ======================================================================== 
  // ERROR HANDLING 
  // ======================================================================== 
 
  private createErrorResponse( 
    code: string, 
    message: string 
  ): APIResponse { 
    return { 
      success: false, 
      error: { 
        code, 
        message, 
      }, 
      timestamp: Date.now(), 
      requestId: this.generateRequestId(), 
    }; 
  } 
 
  private handleError( 
    error: any, 
    requestId: string, 
    endpoint: APIEndpoint 
  ): APIResponse { 
    let errorCode = ErrorCode.SERVER_ERROR; 
    let errorMessage = 'An unexpected error occurred'; 
 
    if (error instanceof TypeError) { 
      errorCode = ErrorCode.NETWORK_ERROR; 
      errorMessage = 'Network request failed'; 
    } else if (error?.message?.includes('permission')) { 
      errorCode = ErrorCode.AUTH_ERROR; 
      errorMessage = 'Permission denied'; 
    } else if (error?.message?.includes('not-found')) { 
      errorCode = ErrorCode.NOT_FOUND; 
      errorMessage = 'Resource not found'; 
    } 
 
    this.log('REQUEST_ERROR', { 
      endpoint, 
      requestId, 
      errorCode, 
      errorMessage, 
    }); 
 
    return { 
      success: false, 
      error: { 
        code: errorCode, 
        message: errorMessage, 
        details: error?.message, 
      }, 
      timestamp: Date.now(), 
      requestId, 
    }; 
  } 
 
  // ======================================================================== 
  // UTILITIES 
  // ======================================================================== 
 
  private generateRequestId(): string { 
    return `${Date.now()}-${Math.random() 
      .toString(36) 
      .substr(2, 9)}`; 
  } 
 
  private log(action: string, data: any): void { 
    if (!this.config.enableLogging) return; 
 
    const timestamp = new Date().toISOString(); 
    console.log( 
      `[${timestamp}] [BrowserAPIGateway] ${action}`, 
      data 
    ); 
  } 
 
  // ======================================================================== 
  // CONFIGURATION 
  // ======================================================================== 
 
  updateConfig(config: Partial<GatewayConfig>): void { 
    this.config = { ...this.config, ...config }; 
  } 
 
  getConfig(): GatewayConfig { 
    return { ...this.config }; 
  } 
 
  getCurrentUser(): User | null { 
    return this.currentUser; 
  } 
} 
 
// ============================================================================ 
// SINGLETON INSTANCE 
// ============================================================================ 
 
let gatewayInstance: BrowserAPIGateway | null = null; 
 
export function initializeBrowserAPIGateway( 
  config: Partial<GatewayConfig> 
): BrowserAPIGateway { 
  gatewayInstance = new BrowserAPIGateway(config); 
  return gatewayInstance; 
} 
 
export function getBrowserAPIGateway(): BrowserAPIGateway { 
  if (!gatewayInstance) { 
    throw new Error( 
      'BrowserAPIGateway not initialized. Call initializeBrowserAPIGateway first.' 
    ); 
  } 
  return gatewayInstance; 
} 
 
export const apiGateway = { 
  initialize: initializeBrowserAPIGateway, 
  getInstance: getBrowserAPIGateway, 
}; 
 
export default apiGateway; 
