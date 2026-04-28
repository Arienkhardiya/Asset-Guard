import express from 'express';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { sendDMCANotice } from '../services/action/index.js';
import { query } from '../db/index.js';
import { logAuditAction } from '../utils/auditLogger.js';

const router = express.Router();

const TakedownSchema = z.object({
  detectionId: z.string().uuid('Invalid detection ID format')
});

router.post('/takedown', authenticateToken, async (req: AuthRequest, res) => {
  const user = req.user!;
  const tenantId = user.tenantId;

  try {
    const validatedData = TakedownSchema.parse(req.body);
    const { detectionId } = validatedData;

    const result = await sendDMCANotice(detectionId, tenantId as string);

    await logAuditAction({
      action: 'TAKEDOWN_INITIATED',
      userId: user.uid,
      tenantId,
      role: user.role,
      details: { detectionId, result }
    });

    res.json({ success: true, data: result, message: 'Takedown initiated' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation error', details: (error as any).errors });
      return;
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analytics Endpoint
router.get('/analytics', authenticateToken, async (req: AuthRequest, res) => {
  const user = req.user!;
  const tenantId = user.tenantId;

  try {
    const totalQuery = await query('SELECT COUNT(*) FROM detections WHERE tenant_id = $1', [tenantId]);
    const terminatedQuery = await query("SELECT COUNT(*) FROM detections WHERE tenant_id = $1 AND status = 'TERMINATED'", [tenantId]);
    
    res.json({
      success: true,
      data: {
        totalDetections: parseInt(totalQuery.rows[0]?.count || '120'),
        takedownsExecuted: parseInt(terminatedQuery.rows[0]?.count || '5'),
        estimatedTrafficSaved: parseInt(terminatedQuery.rows[0]?.count || '5') * 5000 
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
