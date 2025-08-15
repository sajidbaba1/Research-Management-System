-- Dummy data for research database

-- Insert dummy project members (depends on research_projects)
INSERT INTO project_members (affiliation, created_at, email, expertise, first_name, is_active, last_name, phone, responsibilities, role, updated_at, project_id) VALUES
('University', '2025-01-01 10:00:00.000000', 'member1@example.com', 'Machine Learning', 'Alice', b'1', 'Johnson', '123-456-7893', 'Data analysis and model development', 'Researcher', '2025-01-01 10:00:00.000000', 5),
('Research Institute', '2025-01-02 11:00:00.000000', 'member2@example.com', 'Healthcare Systems', 'Bob', b'1', 'Williams', '123-456-7894', 'Medical data collection', 'Assistant', '2025-01-02 11:00:00.000000', 5),
('College', '2025-02-01 11:00:00.000000', 'member3@example.com', 'Renewable Energy', 'Carol', b'1', 'Brown', '123-456-7895', 'Equipment setup and maintenance', 'Technician', '2025-02-01 11:00:00.000000', 6);

-- Insert dummy project tasks (depends on research_projects and users)
INSERT INTO project_tasks (actual_hours, completion_date, created_at, dependencies, description, due_date, estimated_hours, notes, priority, progress, status, tags, title, updated_at, assigned_to, project_id) VALUES
(10, NULL, '2025-01-05 10:00:00.000000', 'Data collection', 'Develop initial ML model', '2025-03-01', 40, 'Use Python and TensorFlow', 'HIGH', 25, 'IN_PROGRESS', 'ML,Python', 'Model Development', '2025-01-05 10:00:00.000000', 10, 5),
(5, '2025-02-15', '2025-01-10 11:00:00.000000', NULL, 'Collect medical datasets', '2025-02-15', 20, 'Ensure patient privacy', 'MEDIUM', 100, 'COMPLETED', 'data,collection', 'Data Collection', '2025-01-10 11:00:00.000000', 11, 5),
(0, NULL, '2025-02-05 12:00:00.000000', NULL, 'Review literature on solar panels', '2025-04-01', 15, 'Focus on efficiency improvements', 'LOW', 0, 'PENDING', 'literature,solar', 'Literature Review', '2025-02-05 12:00:00.000000', NULL, 6);

-- Insert dummy project milestones (depends on research_projects)
INSERT INTO project_milestones (completion_date, created_at, deliverables, dependencies, description, due_date, notes, progress, responsible_person, risks, status, title, updated_at, project_id) VALUES
(NULL, '2025-01-03 10:00:00.000000', 'Initial dataset collection report', 'Literature review', 'Complete initial data collection', '2025-03-15', 'Ensure data quality', 30, 'Alice Johnson', 'Data privacy concerns', 'IN_PROGRESS', 'Data Collection Phase', '2025-01-03 10:00:00.000000', 5),
('2025-02-20', '2025-01-04 11:00:00.000000', 'Prototype ML model', 'Data collection', 'Develop working prototype', '2025-02-20', 'Model should achieve 85% accuracy', 100, 'Bob Williams', NULL, 'COMPLETED', 'Prototype Development', '2025-01-04 11:00:00.000000', 5),
(NULL, '2025-02-10 12:00:00.000000', 'Solar panel efficiency analysis', NULL, 'Analyze current solar panel technologies', '2025-05-01', 'Compare at least 5 different technologies', 10, 'Carol Brown', 'Equipment availability', 'PENDING', 'Technology Analysis', '2025-02-10 12:00:00.000000', 6);

-- Insert dummy project risks (depends on research_projects)
INSERT INTO project_risks (created_at, description, impact, mitigation_plan, probability, category, risk_level, risk_score, status, title, updated_at, project_id) VALUES
('2025-01-02 10:00:00.000000', 'Data privacy concerns with patient information', 8, 'Implement data anonymization protocols', 5, 'Data Security', 'HIGH', 40, 'OPEN', 'Patient Data Privacy', '2025-01-02 10:00:00.000000', 5),
('2025-02-02 11:00:00.000000', 'Equipment delays for solar panel testing', 6, 'Source alternative suppliers', 7, 'Resource', 'HIGH', 42, 'OPEN', 'Equipment Delay', '2025-02-02 11:00:00.000000', 6);

-- Insert dummy project budgets (depends on research_projects)
INSERT INTO project_budgets (budgeted_amount, amount, category, created_at, item_description, item_name, notes, status, updated_at, vendor_name, project_id) VALUES
(12000.00, 10000.00, 'Equipment', '2025-01-05 10:00:00.000000', 'GPU servers for ML training', 'GPU Servers', 'High-end NVIDIA GPUs', 'APPROVED', '2025-01-05 10:00:00.000000', 'Tech Supplier Inc.', 5),
(6000.00, 5000.00, 'Personnel', '2025-01-10 11:00:00.000000', 'Research assistant salary', 'Assistant Salary', 'Monthly payment', 'PAID', '2025-01-10 11:00:00.000000', 'HR Services Ltd.', 5);

-- Insert dummy project publications (depends on research_projects)
INSERT INTO project_publications (abstract_text, authors, created_at, doi, journal_name, publication_date, type, title, updated_at, project_id) VALUES
('This paper discusses the application of machine learning in healthcare diagnostics.', 'Alice Johnson, Bob Williams', '2025-03-01 10:00:00.000000', '10.1234/ai-healthcare-2025', 'Journal of AI in Medicine', '2025-03-01', 'JOURNAL_ARTICLE', 'Machine Learning Approaches for Healthcare', '2025-03-01 10:00:00.000000', 5);

-- Insert dummy project patents (depends on research_projects)
INSERT INTO project_patents (abstract_text, assignee, claims, created_at, filing_date, inventors, patent_number, title, type, updated_at, project_id) VALUES
('AI algorithm for medical diagnosis', 'Research Institute', 'Medical diagnostic AI methods', '2025-04-01 10:00:00.000000', '2025-04-01', 'Alice Johnson', 'P123456789', 'Medical Diagnostic AI Algorithm', 'UTILITY', '2025-04-01 10:00:00.000000', 5);

-- Insert dummy project deliverables (depends on research_projects)
INSERT INTO project_deliverables (approval_status, created_at, description, due_date, file_path, file_type, notes, quality_criteria, responsible_person, status, title, type, updated_at, version, project_id) VALUES
('PENDING', '2025-03-01 10:00:00.000000', 'Final ML model for healthcare diagnostics', '2025-06-01', '/deliverables/healthcare_ai_model.zip', 'SOFTWARE', 'Initial version', 'Accuracy > 90%', 'Alice Johnson', 'COMPLETED', 'Healthcare AI Model', 'SOFTWARE', '2025-03-01 10:00:00.000000', '1.0', 5);

-- Insert dummy project documents (depends on research_projects)
INSERT INTO project_documents (created_at, description, file_name, file_path, file_size, file_type, project_id, status, uploaded_by, category, tags, title, updated_at, version) VALUES
('2025-01-15 10:00:00.000000', 'Project proposal document', 'project1_proposal.pdf', '/documents/project1_proposal.pdf', 1024000, 'PROPOSAL', 5, 'ACTIVE', 9, 'PROPOSAL', 'AI, healthcare', 'AI in Healthcare Proposal', '2025-01-15 10:00:00.000000', '1.0'),
('2025-02-15 11:00:00.000000', 'Research methodology', 'project1_methodology.pdf', '/documents/project1_methodology.pdf', 2048000, 'METHODOLOGY', 5, 'ACTIVE', 10, 'METHODOLOGY', 'AI, healthcare, methodology', 'AI Healthcare Methodology', '2025-02-15 11:00:00.000000', '1.0');

-- Insert dummy research analytics (depends on research_projects)
INSERT INTO research_analytics (actual_end_date, calculated_date, completion_rate, end_date, on_time_completion, start_date, actual_duration_days, duration_days, project_id, project_title, created_by, created_date, remarks, status, updated_by, updated_date) VALUES
(NULL, '2025-03-01', 0.85, '2025-12-31', b'1', '2025-01-01', 100, 365, 5, 'AI in Healthcare', 'Admin User', '2025-03-01', 'Model training in progress', 'ACTIVE', 'Admin User', '2025-03-01'),
(NULL, '2025-03-01', 0.10, '2025-11-30', b'1', '2025-02-01', 10, 300, 6, 'Sustainable Energy', 'Admin User', '2025-03-01', 'Initial phase', 'ACTIVE', 'Admin User', '2025-03-01');
