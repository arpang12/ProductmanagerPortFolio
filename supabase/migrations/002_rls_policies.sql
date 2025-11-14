-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_study_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE embed_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_paragraphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousels ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can access their organization" ON organizations
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- User profiles policies
CREATE POLICY "Users can access their own profile" ON user_profiles
  FOR ALL USING (user_id = auth.uid());

-- Assets policies
CREATE POLICY "Users can access their org's assets" ON assets
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Case studies policies
CREATE POLICY "Users can access their org's case studies" ON case_studies
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read published case studies" ON case_studies
  FOR SELECT USING (status = 'published');

-- Case study sections policies
CREATE POLICY "Users can access sections of their org's case studies" ON case_study_sections
  FOR ALL USING (
    case_study_id IN (
      SELECT case_study_id FROM case_studies cs
      JOIN user_profiles up ON cs.org_id = up.org_id
      WHERE up.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read sections of published case studies" ON case_study_sections
  FOR SELECT USING (
    case_study_id IN (
      SELECT case_study_id FROM case_studies 
      WHERE status = 'published'
    )
  );

-- Section assets policies
CREATE POLICY "Users can access section assets of their org" ON section_assets
  FOR ALL USING (
    section_id IN (
      SELECT css.section_id FROM case_study_sections css
      JOIN case_studies cs ON css.case_study_id = cs.case_study_id
      JOIN user_profiles up ON cs.org_id = up.org_id
      WHERE up.user_id = auth.uid()
    )
  );

-- Embed widgets policies
CREATE POLICY "Users can access embed widgets of their org" ON embed_widgets
  FOR ALL USING (
    section_id IN (
      SELECT css.section_id FROM case_study_sections css
      JOIN case_studies cs ON css.case_study_id = cs.case_study_id
      JOIN user_profiles up ON cs.org_id = up.org_id
      WHERE up.user_id = auth.uid()
    )
  );

-- Story sections policies
CREATE POLICY "Users can access their org's story" ON story_sections
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read story sections" ON story_sections
  FOR SELECT USING (true);

-- Story paragraphs policies
CREATE POLICY "Users can access their org's story paragraphs" ON story_paragraphs
  FOR ALL USING (
    story_id IN (
      SELECT ss.story_id FROM story_sections ss
      JOIN user_profiles up ON ss.org_id = up.org_id
      WHERE up.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read story paragraphs" ON story_paragraphs
  FOR SELECT USING (true);

-- Carousel policies
CREATE POLICY "Users can access their org's carousels" ON carousels
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read carousels" ON carousels
  FOR SELECT USING (true);

-- Carousel slides policies
CREATE POLICY "Users can access their org's carousel slides" ON carousel_slides
  FOR ALL USING (
    carousel_id IN (
      SELECT c.carousel_id FROM carousels c
      JOIN user_profiles up ON c.org_id = up.org_id
      WHERE up.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read active carousel slides" ON carousel_slides
  FOR SELECT USING (is_active = true);

-- Skill categories policies
CREATE POLICY "Users can access their org's skill categories" ON skill_categories
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read skill categories" ON skill_categories
  FOR SELECT USING (true);

-- Skills policies
CREATE POLICY "Users can access skills in their org's categories" ON skills
  FOR ALL USING (
    category_id IN (
      SELECT sc.category_id FROM skill_categories sc
      JOIN user_profiles up ON sc.org_id = up.org_id
      WHERE up.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read skills" ON skills
  FOR SELECT USING (true);

-- Tools policies
CREATE POLICY "Users can access their org's tools" ON tools
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read tools" ON tools
  FOR SELECT USING (true);

-- Journey timeline policies
CREATE POLICY "Users can access their org's journey timeline" ON journey_timelines
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read journey timelines" ON journey_timelines
  FOR SELECT USING (true);

-- Journey milestones policies
CREATE POLICY "Users can access milestones in their org's timeline" ON journey_milestones
  FOR ALL USING (
    timeline_id IN (
      SELECT jt.timeline_id FROM journey_timelines jt
      JOIN user_profiles up ON jt.org_id = up.org_id
      WHERE up.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read journey milestones" ON journey_milestones
  FOR SELECT USING (true);

-- Contact sections policies
CREATE POLICY "Users can access their org's contact section" ON contact_sections
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read contact sections" ON contact_sections
  FOR SELECT USING (true);

-- Social links policies
CREATE POLICY "Users can access their org's social links" ON social_links
  FOR ALL USING (
    contact_id IN (
      SELECT cs.contact_id FROM contact_sections cs
      JOIN user_profiles up ON cs.org_id = up.org_id
      WHERE up.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read social links" ON social_links
  FOR SELECT USING (true);

-- CV sections policies
CREATE POLICY "Users can access their org's CV section" ON cv_sections
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read CV sections" ON cv_sections
  FOR SELECT USING (true);

-- CV versions policies
CREATE POLICY "Users can access CV versions in their org's section" ON cv_versions
  FOR ALL USING (
    cv_section_id IN (
      SELECT cvs.cv_section_id FROM cv_sections cvs
      JOIN user_profiles up ON cvs.org_id = up.org_id
      WHERE up.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read active CV versions" ON cv_versions
  FOR SELECT USING (is_active = true);

-- AI configurations policies
CREATE POLICY "Users can access their org's AI config" ON ai_configurations
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Upload sessions policies
CREATE POLICY "Users can access their own upload sessions" ON upload_sessions
  FOR ALL USING (user_id = auth.uid());

-- Audit logs policies
CREATE POLICY "Users can read their org's audit logs" ON audit_logs
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );