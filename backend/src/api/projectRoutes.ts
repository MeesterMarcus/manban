import { Router, Request, Response } from 'express';
import * as dataService from '../services/dataService';

const router = Router();

// GET /api/projects/:id - Fetch a single project by ID
router.get('/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const project = dataService.getProjectById(id);
  if (project) {
    res.json(project);
  } else {
    res.status(404).json({ message: 'Project not found' });
  }
});

// GET /api/default-project - Fetch the default project details
router.get('/default-project', (req: Request, res: Response) => {
    const project = dataService.getDefaultProject();
    if (project) {
        res.json(project);
    } else {
        res.status(404).json({ message: 'Default project not configured or found' });
    }
});

export default router; 