-- ============================================================
-- GALLIA MVP — PROMPT 1A : Tables
-- À coller dans Supabase SQL Editor
-- ============================================================

-- Extension UUID (activée par défaut sur Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE 1 : galliens
-- ============================================================
CREATE TABLE IF NOT EXISTS galliens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_cecg     VARCHAR(14) UNIQUE,
  prenom          VARCHAR(100) NOT NULL,
  nom             VARCHAR(100) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  date_naissance  DATE,
  lieu_naissance  VARCHAR(200),
  pays            VARCHAR(60),
  parrain_id      UUID REFERENCES galliens(id) ON DELETE SET NULL,
  serment_signe   BOOLEAN DEFAULT false,
  serment_date    TIMESTAMP WITH TIME ZONE,
  kyc_hash_zk     VARCHAR(64) UNIQUE,
  kyc_valide      BOOLEAN DEFAULT false,
  kyc_date        TIMESTAMP WITH TIME ZONE,
  cecg_statut     VARCHAR(30) DEFAULT 'aucune'
                  CHECK (cecg_statut IN ('aucune','provisoire_solidaire','provisoire_parrainage','definitive')),
  cecg_date       TIMESTAMP WITH TIME ZONE,
  cecg_chemin     VARCHAR(20)
                  CHECK (cecg_chemin IN ('standard','solidaire','parrainage') OR cecg_chemin IS NULL),
  rang            VARCHAR(30) DEFAULT 'Aspirant',
  rgpd_consent    BOOLEAN DEFAULT false,
  rgpd_date       TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE 2 : merite_gallien
-- RÈGLE ABSOLUE : points_total ne diminue JAMAIS
-- ============================================================
CREATE TABLE IF NOT EXISTS merite_gallien (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallien_id           UUID REFERENCES galliens(id) ON DELETE CASCADE UNIQUE NOT NULL,
  points_total         INTEGER DEFAULT 0 CHECK (points_total >= 0),
  points_parrainages   INTEGER DEFAULT 0 CHECK (points_parrainages >= 0),
  points_commissions   INTEGER DEFAULT 0 CHECK (points_commissions >= 0),
  points_missions      INTEGER DEFAULT 0 CHECK (points_missions >= 0),
  points_anciennete    INTEGER DEFAULT 0 CHECK (points_anciennete >= 0),
  rang_merite          VARCHAR(30) DEFAULT 'Semence',
  updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE 3 : transactions_gl
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions_gl (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type             VARCHAR(30) NOT NULL,
  expediteur_id    UUID REFERENCES galliens(id) ON DELETE SET NULL,
  destinataire_id  UUID REFERENCES galliens(id) ON DELETE SET NULL,
  montant_gl       DECIMAL(18,2) NOT NULL,
  merite_genere    INTEGER DEFAULT 0,
  description      TEXT,
  statut           VARCHAR(20) DEFAULT 'confirme'
                   CHECK (statut IN ('confirme','en_attente','annule')),
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE 4 : matrices_parrainage
-- ============================================================
CREATE TABLE IF NOT EXISTS matrices_parrainage (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commandeur_id   UUID REFERENCES galliens(id) ON DELETE CASCADE NOT NULL,
  filleul_id      UUID REFERENCES galliens(id) ON DELETE CASCADE NOT NULL,
  niveau          INTEGER NOT NULL CHECK (niveau BETWEEN 1 AND 5),
  commission_gl   DECIMAL(18,2) NOT NULL DEFAULT 0,
  merite_genere   INTEGER DEFAULT 0,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (commandeur_id, filleul_id)
);

-- ============================================================
-- TABLE 5 : cecg_solidaire
-- ============================================================
CREATE TABLE IF NOT EXISTS cecg_solidaire (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallien_id          UUID REFERENCES galliens(id) ON DELETE CASCADE UNIQUE NOT NULL,
  justificatif_type   VARCHAR(30)
                      CHECK (justificatif_type IN ('rsa','chomage','etudiant','autre') OR justificatif_type IS NULL),
  justificatif_url    VARCHAR(500),
  statut              VARCHAR(20) DEFAULT 'en_attente'
                      CHECK (statut IN ('en_attente','valide','refuse')),
  parrainages_count   INTEGER DEFAULT 0 CHECK (parrainages_count >= 0),
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE 6 : notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallien_id   UUID REFERENCES galliens(id) ON DELETE CASCADE NOT NULL,
  type         VARCHAR(40) NOT NULL,
  titre        VARCHAR(200) NOT NULL,
  message      TEXT NOT NULL,
  lue          BOOLEAN DEFAULT false,
  metadata     JSONB,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEX
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_galliens_parrain_id
  ON galliens(parrain_id);

CREATE INDEX IF NOT EXISTS idx_galliens_cecg_statut
  ON galliens(cecg_statut);

CREATE INDEX IF NOT EXISTS idx_galliens_email
  ON galliens(email);

CREATE INDEX IF NOT EXISTS idx_notifications_gallien_lue_date
  ON notifications(gallien_id, lue, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_gl_destinataire
  ON transactions_gl(destinataire_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_matrices_parrainage_commandeur
  ON matrices_parrainage(commandeur_id, niveau);

CREATE INDEX IF NOT EXISTS idx_merite_gallien_gallien_id
  ON merite_gallien(gallien_id);

-- ============================================================
-- TRIGGER updated_at sur galliens
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER galliens_updated_at
  BEFORE UPDATE ON galliens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER : création automatique merite_gallien à l'inscription
-- ============================================================
CREATE OR REPLACE FUNCTION init_merite_gallien()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO merite_gallien (gallien_id)
  VALUES (NEW.id)
  ON CONFLICT (gallien_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_init_merite
  AFTER INSERT ON galliens
  FOR EACH ROW EXECUTE FUNCTION init_merite_gallien();

-- ============================================================
-- FONCTION : générer numero_cecg (GAL-YYYY-XXXXX)
-- ============================================================
CREATE OR REPLACE FUNCTION generer_numero_cecg(gallien_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  v_annee     VARCHAR(4);
  v_sequence  INTEGER;
  v_numero    VARCHAR(14);
BEGIN
  v_annee := TO_CHAR(NOW(), 'YYYY');

  SELECT COUNT(*) + 1
  INTO v_sequence
  FROM galliens
  WHERE numero_cecg IS NOT NULL
    AND numero_cecg LIKE 'GAL-' || v_annee || '-%';

  v_numero := 'GAL-' || v_annee || '-' || LPAD(v_sequence::TEXT, 5, '0');

  UPDATE galliens
  SET numero_cecg = v_numero
  WHERE id = gallien_id
    AND numero_cecg IS NULL;

  RETURN v_numero;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
