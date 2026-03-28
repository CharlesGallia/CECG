-- ============================================================
-- GALLIA MVP — PROMPT 1B : Fonctions, RLS, Trigger webhook
-- À coller dans Supabase SQL Editor APRÈS 001_tables.sql
-- ============================================================

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE galliens           ENABLE ROW LEVEL SECURITY;
ALTER TABLE merite_gallien     ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions_gl    ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrices_parrainage ENABLE ROW LEVEL SECURITY;
ALTER TABLE cecg_solidaire     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- galliens : chaque Gallien voit uniquement ses données
-- -------------------------------------------------------
CREATE POLICY "galliens_select_own" ON galliens
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "galliens_insert_own" ON galliens
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "galliens_update_own" ON galliens
  FOR UPDATE USING (auth.uid() = id);

-- Lecture publique limitée pour vérification CECG et pages publiques
CREATE POLICY "galliens_public_verify" ON galliens
  FOR SELECT USING (
    numero_cecg IS NOT NULL
    AND cecg_statut = 'definitive'
  );

-- -------------------------------------------------------
-- merite_gallien
-- -------------------------------------------------------
CREATE POLICY "merite_select_own" ON merite_gallien
  FOR SELECT USING (auth.uid() = gallien_id);

CREATE POLICY "merite_update_own" ON merite_gallien
  FOR UPDATE USING (auth.uid() = gallien_id);

-- -------------------------------------------------------
-- transactions_gl
-- -------------------------------------------------------
CREATE POLICY "transactions_select_own" ON transactions_gl
  FOR SELECT USING (
    auth.uid() = expediteur_id
    OR auth.uid() = destinataire_id
  );

-- -------------------------------------------------------
-- matrices_parrainage
-- -------------------------------------------------------
CREATE POLICY "matrices_select_own" ON matrices_parrainage
  FOR SELECT USING (
    auth.uid() = commandeur_id
    OR auth.uid() = filleul_id
  );

-- -------------------------------------------------------
-- cecg_solidaire
-- -------------------------------------------------------
CREATE POLICY "solidaire_select_own" ON cecg_solidaire
  FOR SELECT USING (auth.uid() = gallien_id);

CREATE POLICY "solidaire_insert_own" ON cecg_solidaire
  FOR INSERT WITH CHECK (auth.uid() = gallien_id);

CREATE POLICY "solidaire_update_own" ON cecg_solidaire
  FOR UPDATE USING (auth.uid() = gallien_id);

-- -------------------------------------------------------
-- notifications
-- -------------------------------------------------------
CREATE POLICY "notifs_select_own" ON notifications
  FOR SELECT USING (auth.uid() = gallien_id);

CREATE POLICY "notifs_update_own" ON notifications
  FOR UPDATE USING (auth.uid() = gallien_id);

-- ============================================================
-- FONCTION 1 : incrementer_merite
-- RÈGLE ABSOLUE : points_total ne diminue JAMAIS
-- ============================================================
CREATE OR REPLACE FUNCTION incrementer_merite(
  p_gallien_id UUID,
  p_points     INTEGER,
  p_categorie  VARCHAR
)
RETURNS VOID AS $$
DECLARE
  v_rang_nouveau VARCHAR(30);
  v_total_nouveau INTEGER;
BEGIN
  -- Mettre à jour la bonne colonne de catégorie
  UPDATE merite_gallien
  SET
    points_total = points_total + p_points,
    points_parrainages = CASE WHEN p_categorie = 'parrainages'
                              THEN points_parrainages + p_points
                              ELSE points_parrainages END,
    points_commissions = CASE WHEN p_categorie = 'commissions'
                              THEN points_commissions + p_points
                              ELSE points_commissions END,
    points_missions    = CASE WHEN p_categorie = 'missions'
                              THEN points_missions + p_points
                              ELSE points_missions END,
    points_anciennete  = CASE WHEN p_categorie = 'anciennete'
                              THEN points_anciennete + p_points
                              ELSE points_anciennete END,
    updated_at = NOW()
  WHERE gallien_id = p_gallien_id
  RETURNING points_total INTO v_total_nouveau;

  -- Calculer le rang selon les points
  v_rang_nouveau := CASE
    WHEN v_total_nouveau >= 50000 THEN 'Forêt'
    WHEN v_total_nouveau >= 15000 THEN 'Chêne Gallien'
    WHEN v_total_nouveau >= 5000  THEN 'Arbre'
    WHEN v_total_nouveau >= 2000  THEN 'Racine'
    WHEN v_total_nouveau >= 500   THEN 'Pousse'
    ELSE 'Semence'
  END;

  -- Mettre à jour le rang dans merite_gallien
  UPDATE merite_gallien
  SET rang_merite = v_rang_nouveau
  WHERE gallien_id = p_gallien_id;

  -- Mettre à jour le rang dans galliens
  UPDATE galliens
  SET rang = v_rang_nouveau
  WHERE id = p_gallien_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FONCTION 2 : get_lignee_ascendante (N1 → N5)
-- Remonte la chaîne des parrains depuis un Gallien
-- ============================================================
CREATE OR REPLACE FUNCTION get_lignee_ascendante(p_gallien_id UUID)
RETURNS TABLE (
  niveau      INTEGER,
  parrain_id  UUID,
  prenom      VARCHAR,
  nom         VARCHAR,
  numero_cecg VARCHAR,
  cecg_statut VARCHAR
) AS $$
WITH RECURSIVE lignee AS (
  -- Niveau 1 : parrain direct
  SELECT
    1 AS niveau,
    g.parrain_id,
    p.prenom,
    p.nom,
    p.numero_cecg,
    p.cecg_statut
  FROM galliens g
  JOIN galliens p ON p.id = g.parrain_id
  WHERE g.id = p_gallien_id
    AND g.parrain_id IS NOT NULL

  UNION ALL

  -- Niveaux 2→5 : remontée récursive
  SELECT
    l.niveau + 1,
    g2.parrain_id,
    p2.prenom,
    p2.nom,
    p2.numero_cecg,
    p2.cecg_statut
  FROM lignee l
  JOIN galliens g2 ON g2.id = l.parrain_id
  JOIN galliens p2 ON p2.id = g2.parrain_id
  WHERE l.niveau < 5
    AND g2.parrain_id IS NOT NULL
)
SELECT * FROM lignee;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================
-- FONCTION 3 : get_reseau_descendant (N1 → N5)
-- Descend dans tous les filleuls depuis un Gallien
-- ============================================================
CREATE OR REPLACE FUNCTION get_reseau_descendant(p_gallien_id UUID)
RETURNS TABLE (
  niveau      INTEGER,
  filleul_id  UUID,
  prenom      VARCHAR,
  nom         VARCHAR,
  cecg_statut VARCHAR,
  numero_cecg VARCHAR
) AS $$
WITH RECURSIVE reseau AS (
  -- Niveau 1 : filleuls directs
  SELECT
    1 AS niveau,
    g.id AS filleul_id,
    g.prenom,
    g.nom,
    g.cecg_statut,
    g.numero_cecg
  FROM galliens g
  WHERE g.parrain_id = p_gallien_id

  UNION ALL

  -- Niveaux 2→5 : descente récursive
  SELECT
    r.niveau + 1,
    g2.id,
    g2.prenom,
    g2.nom,
    g2.cecg_statut,
    g2.numero_cecg
  FROM reseau r
  JOIN galliens g2 ON g2.parrain_id = r.filleul_id
  WHERE r.niveau < 5
)
SELECT * FROM reseau;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================
-- FONCTION 4 : get_stats_reseau
-- Statistiques complètes du réseau d'un Gallien
-- ============================================================
CREATE OR REPLACE FUNCTION get_stats_reseau(p_gallien_id UUID)
RETURNS TABLE (
  count_n1              BIGINT,
  count_n2              BIGINT,
  count_n3              BIGINT,
  count_n4              BIGINT,
  count_n5              BIGINT,
  total_reseau          BIGINT,
  commissions_total_gl  NUMERIC,
  commissions_mois_gl   NUMERIC
) AS $$
DECLARE
  v_reseau RECORD;
BEGIN
  -- Compter par niveau
  SELECT
    COUNT(*) FILTER (WHERE r.niveau = 1) AS n1,
    COUNT(*) FILTER (WHERE r.niveau = 2) AS n2,
    COUNT(*) FILTER (WHERE r.niveau = 3) AS n3,
    COUNT(*) FILTER (WHERE r.niveau = 4) AS n4,
    COUNT(*) FILTER (WHERE r.niveau = 5) AS n5,
    COUNT(*) AS total
  INTO v_reseau
  FROM get_reseau_descendant(p_gallien_id) r;

  RETURN QUERY
  SELECT
    v_reseau.n1,
    v_reseau.n2,
    v_reseau.n3,
    v_reseau.n4,
    v_reseau.n5,
    v_reseau.total,
    -- Commissions totales reçues
    COALESCE((
      SELECT SUM(t.montant_gl)
      FROM transactions_gl t
      WHERE t.destinataire_id = p_gallien_id
        AND t.type LIKE 'commission_%'
        AND t.statut = 'confirme'
    ), 0),
    -- Commissions du mois en cours
    COALESCE((
      SELECT SUM(t.montant_gl)
      FROM transactions_gl t
      WHERE t.destinataire_id = p_gallien_id
        AND t.type LIKE 'commission_%'
        AND t.statut = 'confirme'
        AND DATE_TRUNC('month', t.created_at) = DATE_TRUNC('month', NOW())
    ), 0);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- TRIGGER WEBHOOK : cecg_statut → 'definitive'
-- Déclenche Edge Function distribuer-commissions
-- ============================================================
CREATE OR REPLACE FUNCTION notify_cecg_definitive()
RETURNS TRIGGER AS $$
BEGIN
  -- Ne déclencher que lors du passage à 'definitive'
  IF NEW.cecg_statut = 'definitive'
     AND (OLD.cecg_statut IS DISTINCT FROM 'definitive') THEN

    -- Appel Edge Function via pg_net (HTTP async)
    PERFORM net.http_post(
      url    := current_setting('app.supabase_url') || '/functions/v1/distribuer-commissions',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body   := jsonb_build_object('gallienId', NEW.id::text)
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_cecg_definitive
  AFTER UPDATE OF cecg_statut ON galliens
  FOR EACH ROW EXECUTE FUNCTION notify_cecg_definitive();

-- ============================================================
-- CONFIGURATION : stocker les variables d'app pour le trigger
-- À exécuter avec les vraies valeurs dans Supabase
-- ============================================================
-- ALTER DATABASE postgres SET app.supabase_url = 'https://your-project.supabase.co';
-- ALTER DATABASE postgres SET app.service_role_key = 'votre_service_role_key';
-- (décommenter et remplacer avec vos vraies valeurs)

-- ============================================================
-- REALTIME : activer les publications pour les tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE galliens;
ALTER PUBLICATION supabase_realtime ADD TABLE merite_gallien;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions_gl;

-- ============================================================
-- STORAGE : bucket privé pour justificatifs solidaires
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('justificatifs', 'justificatifs', false)
ON CONFLICT (id) DO NOTHING;

-- Politique : upload uniquement par le Gallien concerné
CREATE POLICY "justificatifs_upload_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'justificatifs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "justificatifs_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'justificatifs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
