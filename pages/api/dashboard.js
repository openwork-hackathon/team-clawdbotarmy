import { getDashboard } from '../../src/api/analysis';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = await getDashboard();
    
    if (!data || data.error) {
      return res.status(500).json({ 
        error: 'Failed to fetch dashboard data',
        details: data?.error 
      });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
