import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { LaborTypeModel } from '../models/labor-type.model';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const active = req.query.active !== undefined ? req.query.active === 'true' : undefined;
    const laborTypes = await LaborTypeModel.findAll(active);
    res.json(laborTypes);
  } catch (error) {
    console.error('List labor types error:', error);
    res.status(500).json({ error: 'Erro ao listar tipos de mão de obra' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const laborType = await LaborTypeModel.findById(id);
    if (!laborType) {
      res.status(404).json({ error: 'Tipo de mão de obra não encontrado' });
      return;
    }

    res.json(laborType);
  } catch (error) {
    console.error('Get labor type error:', error);
    res.status(500).json({ error: 'Erro ao buscar tipo de mão de obra' });
  }
});

export default router;

