import express from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.js';
import { scanQueue } from '../services/queue/bullmq.js';
import { query } from '../db/index.js';
import { logAuditAction } from '../utils/auditLogger.js';
import { GoogleGenAI, Type } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const router = express.Router();
const StartScanSchema = z.object({
    searchQuery: z.string().min(1, 'Search query is required').max(200),
    type: z.enum(['WEB', 'LIVE']).default('WEB')
});
const LiveScanSchema = z.object({
    streamUrl: z.string().url('Must be a valid URL')
});
// Trigger a web scan
router.post('/start', authenticateToken, async (req, res) => {
    const user = req.user;
    const tenantId = user.tenantId;
    try {
        const validatedData = StartScanSchema.parse(req.body);
        const { searchQuery, type } = validatedData;
        // Enqueue the scan job (only if Redis is enabled)
        if (!scanQueue) {
            console.warn('[AssetGuard] Redis/BullMQ is disabled. Skipping queue.');
            // Return a simulated success for preview purposes or handle as error
            res.json({ success: true, data: { jobId: 'simulated-' + Date.now() }, message: 'Scan simulated (Redis disabled)' });
            return;
        }
        const job = await scanQueue.add('webScan', {
            searchQuery,
            type,
            tenantId: tenantId
        });
        await logAuditAction({
            action: 'SCAN_STARTED',
            userId: user.uid,
            tenantId,
            role: user.role,
            details: { searchQuery, type, jobId: job.id }
        });
        res.json({ success: true, data: { jobId: job.id }, message: 'Scan initiated' });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
            return;
        }
        res.status(500).json({ success: false, error: error.message });
    }
});
// Start Live Server Monitor
router.post('/live/start', authenticateToken, async (req, res) => {
    const user = req.user;
    const tenantId = user.tenantId;
    try {
        const validatedData = LiveScanSchema.parse(req.body);
        const { streamUrl } = validatedData;
        // In production, this might spawn a worker process specifically for continuous monitoring
        if (!scanQueue) {
            res.json({ success: true, data: { jobId: 'simulated-live-' + Date.now() }, message: 'Live monitor simulated (Redis disabled)' });
            return;
        }
        const job = await scanQueue.add('liveScan', { streamUrl, tenantId }, { repeat: { every: 10000, limit: 100 } });
        await logAuditAction({
            action: 'LIVE_MONITOR_STARTED',
            userId: user.uid,
            tenantId,
            role: user.role,
            details: { streamUrl }
        });
        res.json({ success: true, data: { jobId: job.id }, message: 'Live monitoring started' });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
            return;
        }
        res.status(500).json({ success: false, error: error.message });
    }
});
// Fetch Detections
router.get('/detections', authenticateToken, async (req, res) => {
    const user = req.user;
    const tenantId = user.tenantId;
    try {
        const { rows } = await query('SELECT * FROM detections WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 100', [tenantId]);
        res.json({ success: true, data: rows });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// Scan History
router.get('/history', authenticateToken, async (req, res) => {
    const user = req.user;
    try {
        const { rows } = await query('SELECT * FROM scans WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 50', [user.tenantId]);
        res.json({ success: true, data: rows });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
router.post('/history', authenticateToken, async (req, res) => {
    const user = req.user;
    const { inputQuery, riskLevel, similarity, confidence, spreadLevel, totalLinks } = req.body;
    try {
        await query(`INSERT INTO scans (tenant_id, created_by, input_query, risk_level, similarity, confidence, spread_level, total_links) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [user.tenantId, user.uid, inputQuery, riskLevel, similarity, confidence, spreadLevel, totalLinks]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// Search API Proxy
router.post('/search', authenticateToken, async (req, res) => {
    try {
        const { queries } = req.body;
        const mockResults = [
            { url: "https://example-pirate-site.com/watch/leak", platform: "Web", title: "Leaked Content", snippet: "Watch the latest leak here" },
            { url: "https://t.me/pirate_group_xyz", platform: "Telegram", title: "Pirate Group", snippet: "Download HD rip" }
        ];
        res.json({ success: true, data: { results: mockResults, total_found: mockResults.length, mode: 'simulated' } });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// AI Proxies
router.post('/ai/fingerprint', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;
        const schema = {
            type: Type.OBJECT,
            properties: {
                content_type: { type: Type.STRING },
                fingerprint: {
                    type: Type.OBJECT,
                    properties: {
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        entities: { type: Type.ARRAY, items: { type: Type.STRING } },
                        patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
                        unique_identifiers: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["keywords", "entities", "patterns", "unique_identifiers"]
                },
                search_queries: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["content_type", "fingerprint", "search_queries"]
        };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are a cybersecurity expert. Given this threat intel report, content, or metadata, identify what is being leaked or attacked, and output an extraction fingerprint including Google search queries that would discover it alive on the internet. Content: ${content}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        res.json({ success: true, data: JSON.parse(response.text || "{}") });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
router.post('/ai/analyze', authenticateToken, async (req, res) => {
    try {
        const { content, scanData } = req.body;
        const schema = {
            type: Type.OBJECT,
            properties: {
                content_type: { type: Type.STRING },
                similarity: { type: Type.NUMBER },
                duplicate_detected: { type: Type.BOOLEAN },
                confidence: { type: Type.STRING },
                risk_level: { type: Type.STRING },
                spread_level: { type: Type.STRING },
                platforms_detected: { type: Type.ARRAY, items: { type: Type.STRING } },
                platform_distribution: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            platform: { type: Type.STRING },
                            count: { type: Type.NUMBER }
                        },
                        required: ["platform", "count"]
                    }
                },
                total_links_found: { type: Type.NUMBER },
                flagged_links: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            url: { type: Type.STRING },
                            platform: { type: Type.STRING },
                            risk: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        },
                        required: ["url", "platform", "risk", "reason"]
                    }
                },
                ownership_analysis: {
                    type: Type.OBJECT,
                    properties: {
                        likely_owner: { type: Type.STRING },
                        owner_type: { type: Type.STRING },
                        confidence: { type: Type.NUMBER },
                        notes: { type: Type.STRING }
                    },
                    required: ["likely_owner", "owner_type", "confidence", "notes"]
                },
                business_impact: {
                    type: Type.OBJECT,
                    properties: {
                        estimated_loss: { type: Type.STRING },
                        market_risk: { type: Type.STRING },
                        brand_damage: { type: Type.STRING },
                        scale_of_distribution: { type: Type.STRING }
                    },
                    required: ["estimated_loss", "market_risk", "brand_damage", "scale_of_distribution"]
                },
                explanation: { type: Type.STRING }
            },
            required: ["content_type", "similarity", "duplicate_detected", "confidence", "risk_level", "spread_level", "platforms_detected", "platform_distribution", "total_links_found", "flagged_links", "ownership_analysis", "business_impact", "explanation"]
        };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this content and its live search scan results. Determine the severity, spread risk, likely ownership of the IP, and business impact. Content: ${content}. Scanner Info: Found ${scanData.total_found} hits across the web. URLs: ${scanData.results.map((r) => r.url).join(', ')}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        res.json({ success: true, data: JSON.parse(response.text || "{}") });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
router.post('/ai/actions', authenticateToken, async (req, res) => {
    try {
        const { analysis } = req.body;
        const schema = {
            type: Type.OBJECT,
            properties: {
                actions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            priority: { type: Type.STRING },
                            description: { type: Type.STRING }
                        },
                        required: ["type", "priority", "description"]
                    }
                }
            },
            required: ["actions"]
        };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on this intelligence analysis, recommend 3 specific remediation or takedown actions for a legal analyst. Priority must be Critical, High, Medium, or Low. Analysis: ${JSON.stringify(analysis)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        res.json({ success: true, data: JSON.parse(response.text || "{}") });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
export default router;
