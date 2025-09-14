-- Ensure all professors have proper default modules with AI disabled
UPDATE professores 
SET modules = COALESCE(modules, '{}') || '{"ia": false, "lousa": true, "agenda": true, "dashboard": true, "materiais": true, "pagamentos": true, "ferramentas": true}'::jsonb
WHERE modules IS NULL OR modules = '{}' OR NOT (modules ? 'ia');

-- Update professors to have consistent module structure
UPDATE professores 
SET modules = modules || '{"ia": false}'::jsonb
WHERE NOT (modules ? 'ia');