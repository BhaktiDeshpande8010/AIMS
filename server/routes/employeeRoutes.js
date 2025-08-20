import express from 'express';
import { getEmployees, getEmployeeById, createEmployee, createProcurementRequest } from '../controllers/employeeController.js';

const router = express.Router();

router.get('/', getEmployees);
router.post('/', createEmployee);
router.get('/:id', getEmployeeById);
router.post('/:id/procurement', createProcurementRequest);

export default router;
