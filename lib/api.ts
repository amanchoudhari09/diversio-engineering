export type Employee = {
  employee_id: string
  name: string
  email: string
  department: string
  manager_id: string | null
  manager_name: string | null
  status: 'accepted' | 'rejected'
}

export type ValidationError = {
  employee_id: string
  field: 'manager_id' | 'employee_id' | 'email' | 'relationship'
  code: string
  message: string
  severity: 'error' | 'warning'
}

export type Cycle = {
  employee_ids: string[]
  employee_names: string[]
  path: string
}

export type HRISAnalysis = {
  file_name: string
  processed_at: string
  summary: {
    total_rows: number
    accepted: number
    rejected: number
    errors: number
    warnings: number
  }
  employees: Employee[]
  validation_errors: ValidationError[]
  roots: Employee[]
  managers: Array<{ employee: Employee; direct_reports: Employee[] }>
  cycles: Cycle[]
}

export async function analyzeHRIS(file: File): Promise<HRISAnalysis> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch('/api/hris/analyze/', { method: 'POST', body: formData })
  if (!response.ok) throw new Error('The HRIS service could not analyze this file.')
  return response.json()
}

export const demoAnalysis: HRISAnalysis = {
  file_name: 'employees_q3.csv',
  processed_at: '2026-08-17T14:42:00Z',
  summary: { total_rows: 14, accepted: 13, rejected: 1, errors: 1, warnings: 2 },
  employees: [
    { employee_id: 'E001', name: 'Maya Chen', email: 'maya.chen@northstar.co', department: 'Executive', manager_id: null, manager_name: null, status: 'accepted' },
    { employee_id: 'E002', name: 'Jon Bell', email: 'jon.bell@northstar.co', department: 'Engineering', manager_id: 'E001', manager_name: 'Maya Chen', status: 'accepted' },
    { employee_id: 'E003', name: 'Priya Shah', email: 'priya.shah@northstar.co', department: 'Engineering', manager_id: 'E002', manager_name: 'Jon Bell', status: 'accepted' },
    { employee_id: 'E004', name: 'Luis Moreno', email: 'luis.moreno@northstar.co', department: 'Engineering', manager_id: 'E002', manager_name: 'Jon Bell', status: 'accepted' },
    { employee_id: 'E005', name: 'Ava Williams', email: 'ava.williams@northstar.co', department: 'People', manager_id: 'E001', manager_name: 'Maya Chen', status: 'accepted' },
    { employee_id: 'E006', name: 'Noah Kim', email: 'noah.kim@northstar.co', department: 'People', manager_id: 'E005', manager_name: 'Ava Williams', status: 'accepted' },
    { employee_id: 'E007', name: 'Sofia Patel', email: 'sofia.patel@northstar.co', department: 'Finance', manager_id: 'E001', manager_name: 'Maya Chen', status: 'accepted' },
    { employee_id: 'E008', name: 'Eli Grant', email: 'eli.grant@northstar.co', department: 'Finance', manager_id: 'E007', manager_name: 'Sofia Patel', status: 'accepted' },
    { employee_id: 'E009', name: 'Grace Lee', email: 'grace.lee@northstar.co', department: 'Design', manager_id: 'E001', manager_name: 'Maya Chen', status: 'accepted' },
    { employee_id: 'E010', name: 'Owen Wright', email: 'owen.wright@northstar.co', department: 'Design', manager_id: 'E009', manager_name: 'Grace Lee', status: 'accepted' },
    { employee_id: 'E011', name: 'Nia Brooks', email: 'nia.brooks@northstar.co', department: 'Sales', manager_id: 'E001', manager_name: 'Maya Chen', status: 'accepted' },
    { employee_id: 'E012', name: 'Theo Martin', email: 'theo.martin@northstar.co', department: 'Sales', manager_id: 'E011', manager_name: 'Nia Brooks', status: 'accepted' },
    { employee_id: 'E013', name: 'Milo Reed', email: 'milo.reed@northstar.co', department: 'Sales', manager_id: 'E014', manager_name: 'Harper Jones', status: 'accepted' },
    { employee_id: 'E014', name: 'Harper Jones', email: 'harper.jones@northstar.co', department: 'Sales', manager_id: 'E013', manager_name: 'Milo Reed', status: 'accepted' },
  ],
  validation_errors: [
    { employee_id: 'E013', field: 'manager_id', code: 'MANAGER_NOT_FOUND', message: 'Manager E014 is part of a reporting cycle and cannot be resolved.', severity: 'error' },
    { employee_id: 'E013', field: 'relationship', code: 'REPORTING_CYCLE', message: 'Direct reporting cycle detected: Milo Reed → Harper Jones → Milo Reed.', severity: 'warning' },
    { employee_id: 'E014', field: 'relationship', code: 'REPORTING_CYCLE', message: 'Direct reporting cycle detected: Harper Jones → Milo Reed → Harper Jones.', severity: 'warning' },
  ],
  roots: [{ employee_id: 'E001', name: 'Maya Chen', email: 'maya.chen@northstar.co', department: 'Executive', manager_id: null, manager_name: null, status: 'accepted' }],
  managers: [
    { employee: { employee_id: 'E001', name: 'Maya Chen', email: 'maya.chen@northstar.co', department: 'Executive', manager_id: null, manager_name: null, status: 'accepted' }, direct_reports: [] },
    { employee: { employee_id: 'E002', name: 'Jon Bell', email: 'jon.bell@northstar.co', department: 'Engineering', manager_id: 'E001', manager_name: 'Maya Chen', status: 'accepted' }, direct_reports: [] },
  ],
  cycles: [{ employee_ids: ['E013', 'E014'], employee_names: ['Milo Reed', 'Harper Jones'], path: 'Milo Reed → Harper Jones → Milo Reed' }],
}

// Demo adapter keeps the preview usable until the Django service is connected.
export async function analyzeDemo(file: File): Promise<HRISAnalysis> {
  await new Promise((resolve) => setTimeout(resolve, 850))
  if (!file.name.toLowerCase().endsWith('.csv')) throw new Error('Please choose a CSV file.')
  return { ...demoAnalysis, file_name: file.name, processed_at: new Date().toISOString() }
}
