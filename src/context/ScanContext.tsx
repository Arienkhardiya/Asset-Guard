import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { safeJson } from '../utils/api';

export interface FingerprintResult {
  content_type: string;
  fingerprint: {
    keywords: string[];
    entities: string[];
    patterns: string[];
    unique_identifiers: string[];
  };
  search_queries: string[];
}

export interface ScannerResult {
  results: {
    platform: string;
    url: string;
    title: string;
    snippet: string;
  }[];
  total_found: number;
  mode: 'simulated' | 'live';
}

export interface AnalysisResult {
  content_type: string;
  similarity: number;
  duplicate_detected: boolean;
  confidence: string;
  risk_level: "Low" | "Medium" | "High" | "Critical";
  spread_level: "Low" | "Medium" | "High" | "Viral";
  platforms_detected: string[];
  platform_distribution: {
    platform: string;
    count: number;
  }[];
  total_links_found: number;
  flagged_links: {
    url: string;
    platform: string;
    risk: string;
    reason: string;
  }[];
  ownership_analysis: {
    likely_owner: string;
    owner_type: string;
    confidence: number;
    notes: string;
  };
  business_impact: {
    estimated_loss: string;
    market_risk: string;
    brand_damage: string;
    scale_of_distribution: string;
  };
  explanation: string;
}

export interface ActionResult {
  actions: {
    type: string;
    priority: "High" | "Medium" | "Low" | "Critical";
    description: string;
  }[];
}

interface ScanContextType {
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  currentStep: number;
  systemStatus: 'IDLE' | 'SCANNING' | 'THREAT DETECTED' | 'SECURE';
  fingerprint: FingerprintResult | null;
  scanResult: ScannerResult | null;
  scanMode: 'simulated' | 'live';
  result: AnalysisResult | null;
  actionResult: ActionResult | null;
  error: string;
  pastScans: any[];
  analyzeContent: () => Promise<void>;
  reset: () => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const { userData } = useAuth();
  const [input, setInput] = useState('Leaked screener of unreleased blockbuster movie circulating on encrypted cloud storage forums');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [systemStatus, setSystemStatus] = useState<'IDLE' | 'SCANNING' | 'THREAT DETECTED' | 'SECURE'>('IDLE');
  const [fingerprint, setFingerprint] = useState<FingerprintResult | null>(null);
  const [scanResult, setScanResult] = useState<ScannerResult | null>(null);
  const [scanMode, setScanMode] = useState<'simulated' | 'live'>('simulated');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);
  const [error, setError] = useState('');
  const [pastScans, setPastScans] = useState<any[]>([]);

  const fetchHistory = async () => {
    if (!userData?.tenantId) return;
    try {
      const token = localStorage.getItem('token');
      const url = `/api/scan/history`;
      console.log('[AssetGuard] API CALL:', url);
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { data } = await safeJson(res);
      setPastScans(data || []);
    } catch (e) {
      console.error('[AssetGuard] History fetch failed:', e);
    }
  };

  React.useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, [userData?.tenantId]);

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // --- AI LOGIC ---
  const generateFingerprint = async (content: string): Promise<FingerprintResult> => {
    const token = localStorage.getItem('token');
    const url = `/api/scan/ai/fingerprint`;
    console.log('[AssetGuard] API CALL:', url);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error(`Fingerprint failed: ${res.status}`);
    return safeJson(res);
  };

  const analyzeThreats = async (content: string, scanData: ScannerResult): Promise<AnalysisResult> => {
    const token = localStorage.getItem('token');
    const url = `/api/scan/ai/analyze`;
    console.log('[AssetGuard] API CALL:', url);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content, scanData })
    });
    if (!res.ok) throw new Error(`Threat analysis failed: ${res.status}`);
    return safeJson(res);
  };

  const generateActions = async (analysis: AnalysisResult): Promise<ActionResult> => {
    const token = localStorage.getItem('token');
    const url = `/api/scan/ai/actions`;
    console.log('[AssetGuard] API CALL:', url);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ analysis })
    });
    if (!res.ok) throw new Error(`Generate actions failed: ${res.status}`);
    return safeJson(res);
  };

  const analyzeContent = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setSystemStatus('SCANNING');
    setError('');
    setFingerprint(null);
    setScanResult(null);
    setResult(null);
    setActionResult(null);
    setCurrentStep(-1);
    
    try {
      setCurrentStep(0);
      await delay(800);

      setCurrentStep(1);
      const fp = await generateFingerprint(input);
      setFingerprint(fp);

      setCurrentStep(2);
      
      try {
        const token = localStorage.getItem('token');
        const url = `/api/scan/start`;
        console.log('[AssetGuard] API CALL:', url);
        const scanRes = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ searchQuery: input, type: 'web' })
        });
        await safeJson(scanRes);
      } catch (e) {
        console.error('[AssetGuard] Backend scan start failed:', e);
      }
      
      let searchResponse;
      try {
        const token = localStorage.getItem('token');
        searchResponse = await fetch(`/api/search`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ queries: fp.search_queries })
        });
      } catch (e) {
        console.error('Search failed', e);
      }
      
      let finalScanData: ScannerResult;
      if (!searchResponse) {
        finalScanData = { results: [], total_found: 0, mode: 'simulated' };
      } else {
        finalScanData = await safeJson(searchResponse);
      }
      
      setScanMode(finalScanData.mode);
      setScanResult(finalScanData);

      setCurrentStep(3);
      const analysis = await analyzeThreats(input, finalScanData);
      setResult(analysis);
      
      if (analysis.risk_level === 'High' || analysis.risk_level === 'Critical') {
        setSystemStatus('THREAT DETECTED');
      } else {
        setSystemStatus('SECURE');
      }

      setCurrentStep(4);
      const actions = await generateActions(analysis);
      setActionResult(actions);

      // SAVE TO ENTERPRISE POSTGRES
      if (userData?.tenantId) {
        try {
          const token = localStorage.getItem('token');
          const url_hist = `/api/scan/history`;
          console.log('[AssetGuard] API CALL:', url_hist);
          await fetch(url_hist, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              inputQuery: input,
              riskLevel: analysis.risk_level,
              similarity: analysis.similarity,
              confidence: analysis.confidence,
              spreadLevel: analysis.spread_level,
              totalLinks: analysis.total_links_found
            })
          });

          const url_audit = `/api/audit`;
          console.log('[AssetGuard] API CALL:', url_audit);
          await fetch(url_audit, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              action: 'THREAT_ANALYSIS',
              details: `Analyzed ${analysis.total_links_found} links for query: ${input}. Risk: ${analysis.risk_level}`
            })
          });
          fetchHistory();
        } catch (e) {
          console.error('[AssetGuard] Persistence failed:', e);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during pipeline execution.');
      setSystemStatus('IDLE');
    } finally {
      setLoading(false);
      setCurrentStep(-1);
    }
  };

  const reset = () => {
    setFingerprint(null);
    setScanResult(null);
    setResult(null);
    setActionResult(null);
    setSystemStatus('IDLE');
  };

  return (
    <ScanContext.Provider value={{
      input, setInput,
      loading, currentStep, systemStatus,
      fingerprint, scanResult, scanMode,
      result, actionResult, error, pastScans,
      analyzeContent, reset
    }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
}
