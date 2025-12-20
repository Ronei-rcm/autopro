-- Tabela de parcelas (para contas a receber)
CREATE TABLE IF NOT EXISTS installments (
  id SERIAL PRIMARY KEY,
  account_receivable_id INTEGER NOT NULL REFERENCES accounts_receivable(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  paid_at TIMESTAMP,
  payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'paid', 'overdue', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_installment_number UNIQUE (account_receivable_id, installment_number)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_installments_account_receivable_id ON installments(account_receivable_id);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(due_date);
CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status);
