-- Migration 003 : champs optionnels Declaratio
-- Ajoute une colonne meta JSONB pour stocker province, nom_gallien, motivations,
-- telephone, adresse – JAMAIS exposés sur l'Acte officiel ni sur la CECG.

ALTER TABLE galliens
  ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}';

-- Index GIN pour requêtes éventuelles sur meta
CREATE INDEX IF NOT EXISTS idx_galliens_meta ON galliens USING GIN (meta);

COMMENT ON COLUMN galliens.meta IS
  'Données optionnelles Declaratio (province, nom_gallien, telephone, adresse…).
   JAMAIS affichées sur documents officiels (Acte de Renaissance, CECG).';
