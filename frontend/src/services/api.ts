import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

// Configure axios defaults
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  institution?: string;
  department?: string;
  role?: string;
}

export interface ResearchProject {
  id?: number;
  title: string;
  description: string;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate: string;
  endDate: string;
  budget: number;
  researchArea: string;
  principalInvestigator: string;
  institution: string;
  keywords?: string;
  objectives?: string;
  methodology?: string;
  expectedOutcomes?: string;
  teamSize?: number;
  completionPercentage?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectTask {
  id?: number;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  completionDate?: string;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  tags?: string;
  dependencies?: string;
  notes?: string;
  project: ResearchProject;
  assignedTo?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task extends ProjectTask {
  id: number;
  assignedToId?: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  estimatedHours: number;
  projectId: number;
  assignedToId?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  completionDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  tags?: string;
  dependencies?: string;
  notes?: string;
  assignedToId?: number;
}

export interface ProjectMilestone {
  id?: number;
  title: string;
  description?: string;
  dueDate: string;
  completionDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  deliverables?: string;
  responsiblePerson?: string;
  dependencies?: string;
  risks?: string;
  notes?: string;
  project: ResearchProject;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMember {
  id?: number;
  name: string;
  email: string;
  role: 'PRINCIPAL_INVESTIGATOR' | 'CO_INVESTIGATOR' | 'RESEARCH_ASSISTANT' | 'GRADUATE_STUDENT' | 'POSTDOC' | 'TECHNICIAN' | 'MEMBER';
  expertise?: string;
  affiliation?: string;
  contactInfo?: string;
  project: ResearchProject;
  joinDate?: string;
  responsibilities?: string;
  userId?: number;
  projectId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTeamMemberRequest {
  userId: number;
  role: 'PRINCIPAL_INVESTIGATOR' | 'CO_INVESTIGATOR' | 'RESEARCH_ASSISTANT' | 'GRADUATE_STUDENT' | 'POSTDOC' | 'TECHNICIAN' | 'MEMBER';
  joinDate: string;
  responsibilities?: string;
  projectId: number;
}

export interface Publication {
  id?: number;
  title: string;
  authors?: string;
  journal?: string;
  publishedDate?: string;
  doi?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'PUBLISHED' | 'REJECTED';
  abstract?: string;
  keywords?: string;
  projectId: number;
  project?: ResearchProject;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePublicationRequest {
  title: string;
  authors?: string;
  journal?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'PUBLISHED' | 'REJECTED';
  abstract?: string;
  keywords?: string;
  projectId: number;
}

export interface UpdatePublicationRequest {
  title?: string;
  authors?: string;
  journal?: string;
  publishedDate?: string;
  doi?: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'PUBLISHED' | 'REJECTED';
  abstract?: string;
  keywords?: string;
}

export interface Document {
  id?: number;
  fileName: string;
  fileType: string;
  description?: string;
  filePath: string;
  projectId: number;
  project?: ResearchProject;
  uploadedBy?: string;
  uploadDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDocumentRequest {
  fileName: string;
  fileType: string;
  description?: string;
  filePath: string;
  projectId: number;
}

export interface Risk {
  id?: number;
  title: string;
  description?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: 'LOW' | 'MEDIUM' | 'HIGH';
  impact?: string;
  mitigation?: string;
  status: 'ACTIVE' | 'MITIGATED' | 'CLOSED';
  projectId: number;
  project?: ResearchProject;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRiskRequest {
  title: string;
  description?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: 'LOW' | 'MEDIUM' | 'HIGH';
  impact?: string;
  mitigation?: string;
  status: 'ACTIVE' | 'MITIGATED' | 'CLOSED';
  projectId: number;
}

export interface UpdateRiskRequest {
  title?: string;
  description?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability?: 'LOW' | 'MEDIUM' | 'HIGH';
  impact?: string;
  mitigation?: string;
  status?: 'ACTIVE' | 'MITIGATED' | 'CLOSED';
}

export interface ProjectBudget {
  id?: number;
  category: string;
  subcategory?: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  description?: string;
  fiscalYear?: string;
  fundingSource?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvalDate?: string;
  notes?: string;
  project: ResearchProject;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectDocument {
  id?: number;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedBy?: string;
  documentType?: string;
  version?: string;
  description?: string;
  tags?: string;
  accessLevel: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
  project: ResearchProject;
  uploadDate?: string;
  lastModified?: string;
}

export interface ProjectRisk {
  id?: number;
  title: string;
  category?: string;
  description?: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: number;
  impact: number;
  riskScore: number;
  status: 'ACTIVE' | 'MITIGATED' | 'CLOSED';
  mitigationPlan?: string;
  contingencyPlan?: string;
  owner?: string;
  notes?: string;
  project: ResearchProject;
  createdAt?: string;
  updatedAt?: string;
}

// Budget types for the new API
export interface Budget {
  id: number;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  description?: string;
  startDate: string;
  endDate: string;
  projectId: number;
  project?: ResearchProject;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBudgetRequest {
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  description?: string;
  startDate: string;
  endDate: string;
  projectId: number;
}

export interface UpdateBudgetRequest {
  category?: string;
  allocatedAmount?: number;
  spentAmount?: number;
  description?: string;
  startDate?: string;
  endDate?: string;
}

// Search types
export interface SearchFilters {
  entityTypes: string[];
  dateRange: { start: string; end: string };
  status: string[];
  priority: string[];
}

export interface SearchResult {
  entityId: number;
  entityType: string;
  title: string;
  content: string;
  projectName?: string;
  lastModified?: string;
  relevanceScore: number;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
}

// Milestone types
export interface Milestone {
  id?: number;
  title: string;
  description?: string;
  targetDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completionPercentage: number;
  projectId: number;
  project?: ResearchProject;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMilestoneRequest {
  title: string;
  description?: string;
  targetDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completionPercentage: number;
  projectId: number;
}

export interface UpdateMilestoneRequest {
  title?: string;
  description?: string;
  targetDate?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completionPercentage?: number;
}

// Patent types
export interface Patent {
  id?: number;
  title: string;
  description?: string;
  inventors?: string;
  applicationNumber?: string;
  status: 'DRAFT' | 'FILED' | 'PUBLISHED' | 'GRANTED' | 'REJECTED';
  applicationDate?: string;
  grantDate?: string;
  patentNumber?: string;
  projectId: number;
  project?: ResearchProject;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePatentRequest {
  title: string;
  description?: string;
  inventors?: string;
  status: 'DRAFT' | 'FILED' | 'PUBLISHED' | 'GRANTED' | 'REJECTED';
  applicationDate?: string;
  projectId: number;
}

export interface UpdatePatentRequest {
  title?: string;
  description?: string;
  inventors?: string;
  status?: 'DRAFT' | 'FILED' | 'PUBLISHED' | 'GRANTED' | 'REJECTED';
  applicationDate?: string;
  grantDate?: string;
  patentNumber?: string;
}

// Publication types
export interface Publication {
  id?: number;
  title: string;
  authors?: string;
  journal?: string;
  publishedDate?: string;
  doi?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'PUBLISHED' | 'REJECTED';
  abstract?: string;
  keywords?: string;
  projectId: number;
  project?: ResearchProject;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePublicationRequest {
  title: string;
  authors?: string;
  journal?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'PUBLISHED' | 'REJECTED';
  abstract?: string;
  keywords?: string;
  projectId: number;
}

export interface UpdatePublicationRequest {
  title?: string;
  authors?: string;
  journal?: string;
  publishedDate?: string;
  doi?: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'PUBLISHED' | 'REJECTED';
  abstract?: string;
  keywords?: string;
}

// ChatMessage types
export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  sources?: string[];
}

// Deliverable types
export interface Deliverable {
  id: number;
  title: string;
  description?: string;
  type: 'REPORT' | 'PRESENTATION' | 'SOFTWARE' | 'DATASET' | 'PUBLICATION' | 'OTHER';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  completionDate?: string;
  completionPercentage: number;
  projectId: number;
  project?: ResearchProject;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDeliverableRequest {
  title: string;
  description?: string;
  type: 'REPORT' | 'PRESENTATION' | 'SOFTWARE' | 'DATASET' | 'PUBLICATION' | 'OTHER';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  completionPercentage: number;
  projectId: number;
}

export interface UpdateDeliverableRequest {
  title?: string;
  description?: string;
  type?: 'REPORT' | 'PRESENTATION' | 'SOFTWARE' | 'DATASET' | 'PUBLICATION' | 'OTHER';
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  completionDate?: string;
  completionPercentage?: number;
}

// Analytics types
export interface AnalyticsData {
  id?: number;
  projectId?: number;
  projectTitle?: string;
  project?: ResearchProject;
  completionRate?: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalBudget: number;
  spentBudget: number;
  totalTeamMembers: number;
  totalPublications: number;
  totalRisks: number;
  activeRisks: number;
  projectCompletionRate: number;
  taskCompletionRate: number;
  budgetUtilization: number;
  averageProjectDuration: number;
  createdAt?: string;
  updatedAt?: string;
}

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  signup: async (userData: SignupRequest) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  
  getProjectsByStatus: async (status: string) => {
    const response = await api.get(`/dashboard/projects/status/${status}`);
    return Array.isArray(response.data) ? response.data : [];
  },
  
  getProjectsByPriority: async (priority: string) => {
    const response = await api.get(`/dashboard/projects/priority/${priority}`);
    return Array.isArray(response.data) ? response.data : [];
  },
  
  getRecentProjects: async () => {
    const response = await api.get('/dashboard/projects/recent');
    return Array.isArray(response.data) ? response.data : [];
  },
  
  getActiveProjects: async () => {
    const response = await api.get('/dashboard/projects/active');
    return Array.isArray(response.data) ? response.data : [];
  },
  
  searchProjects: async (query: string) => {
    const response = await api.get(`/dashboard/projects/search?query=${encodeURIComponent(query)}`);
    return Array.isArray(response.data) ? response.data : [];
  },
};

// Projects API
export const projectsAPI = {
  getAll: async (): Promise<ResearchProject[]> => {
    const response = await api.get('/projects');
    return Array.isArray(response.data) ? response.data : [];
  },
  
  getById: async (id: number): Promise<ResearchProject> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  
  create: async (project: Omit<ResearchProject, 'id'>): Promise<ResearchProject> => {
    const response = await api.post('/projects', project);
    return response.data;
  },
  
  update: async (id: number, project: Partial<ResearchProject>): Promise<ResearchProject> => {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (): Promise<ProjectTask[]> => {
    const response = await api.get('/tasks');
    return Array.isArray(response.data) ? response.data : [];
  },
  
  getById: async (id: number): Promise<ProjectTask[]> => {
    const response = await api.get(`/tasks/${id}`);
    return Array.isArray(response.data) ? response.data : [];
  },
  
  getByProjectId: async (projectId: number): Promise<ProjectTask[]> => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return Array.isArray(response.data) ? response.data : [];
  },
  
  getByProjectIdAndStatus: async (projectId: number, status: string): Promise<ProjectTask[]> => {
    const response = await api.get(`/tasks/project/${projectId}/status/${status}`);
    return Array.isArray(response.data) ? response.data : [];
  },
  
  create: async (task: Omit<ProjectTask, 'id'>): Promise<ProjectTask[]> => {
    const response = await api.post('/tasks', task);
    return Array.isArray(response.data) ? response.data : [];
  },
  
  update: async (id: number, task: Partial<ProjectTask>): Promise<ProjectTask[]> => {
    const response = await api.put(`/tasks/${id}`, task);
    return Array.isArray(response.data) ? response.data : [];
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

// Milestones API
export const milestonesAPI = {
  getAll: async (): Promise<ProjectMilestone[]> => {
    const response = await api.get('/milestones');
    return response.data;
  },
  
  getById: async (id: number): Promise<ProjectMilestone> => {
    const response = await api.get(`/milestones/${id}`);
    return response.data;
  },
  
  getByProjectId: async (projectId: number): Promise<ProjectMilestone[]> => {
    const response = await api.get(`/milestones/project/${projectId}`);
    return response.data;
  },
  
  create: async (milestone: Omit<ProjectMilestone, 'id'>): Promise<ProjectMilestone> => {
    const response = await api.post('/milestones', milestone);
    return response.data;
  },
  
  update: async (id: number, milestone: Partial<ProjectMilestone>): Promise<ProjectMilestone> => {
    const response = await api.put(`/milestones/${id}`, milestone);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/milestones/${id}`);
  },
};

// Team Members API
export const teamAPI = {
  getAll: async (): Promise<TeamMember[]> => {
    const response = await api.get('/team-members');
    return Array.isArray(response.data) ? response.data : [];
  },
  
  getById: async (id: number): Promise<TeamMember[]> => {
    const response = await api.get(`/team-members/${id}`);
    return Array.isArray(response.data) ? response.data : [];
  },
  
  getByProjectId: async (projectId: number): Promise<TeamMember[]> => {
    const response = await api.get(`/team-members/project/${projectId}`);
    return Array.isArray(response.data) ? response.data : [];
  },
  
  create: async (member: Omit<TeamMember, 'id'>): Promise<TeamMember[]> => {
    const response = await api.post('/team-members', member);
    return Array.isArray(response.data) ? response.data : [];
  },
  
  update: async (id: number, member: Partial<TeamMember>): Promise<TeamMember[]> => {
    const response = await api.put(`/team-members/${id}`, member);
    return Array.isArray(response.data) ? response.data : [];
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/team-members/${id}`);
  },
};

// Budget API
export const budgetApi = {
  getAllBudgets: async (token: string): Promise<Budget[]> => {
    const response = await api.get('/budgets', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getBudgetByProject: async (projectId: number, token: string): Promise<Budget[]> => {
    const response = await api.get(`/budgets/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createBudget: async (budget: CreateBudgetRequest, token: string): Promise<Budget> => {
    const response = await api.post('/budgets', budget, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateBudget: async (id: number, budget: UpdateBudgetRequest, token: string): Promise<Budget> => {
    const response = await api.put(`/budgets/${id}`, budget, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteBudget: async (id: number, token: string): Promise<void> => {
    await api.delete(`/budgets/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

// Legacy Budget API for backward compatibility
export const budgetAPI = {
  getAll: async (): Promise<ProjectBudget[]> => {
    const response = await api.get('/budgets');
    return response.data;
  },
  
  getByProjectId: async (projectId: number): Promise<ProjectBudget[]> => {
    const response = await api.get(`/budgets/project/${projectId}`);
    return response.data;
  },
  
  create: async (budget: Omit<ProjectBudget, 'id'>): Promise<ProjectBudget> => {
    const response = await api.post('/budgets', budget);
    return response.data;
  },
  
  update: async (id: number, budget: Partial<ProjectBudget>): Promise<ProjectBudget> => {
    const response = await api.put(`/budgets/${id}`, budget);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/budgets/${id}`);
  },
};

// Documents API
export const documentsAPI = {
  getAll: async (): Promise<ProjectDocument[]> => {
    const response = await api.get('/documents');
    return Array.isArray(response.data) ? response.data : [];
  },
  
  getByProjectId: async (projectId: number): Promise<ProjectDocument[]> => {
    const response = await api.get(`/documents/project/${projectId}`);
    return Array.isArray(response.data) ? response.data : [];
  },
  
  upload: async (formData: FormData): Promise<ProjectDocument> => {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
  
  download: async (id: number): Promise<Blob> => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Risks API
export const risksAPI = {
  getAll: async (): Promise<ProjectRisk[]> => {
    const response = await api.get('/risks');
    return Array.isArray(response.data) ? response.data : [];
  },
  
  getByProjectId: async (projectId: number): Promise<ProjectRisk[]> => {
    const response = await api.get(`/risks/project/${projectId}`);
    return Array.isArray(response.data) ? response.data : [];
  },
  
  create: async (risk: CreateRiskRequest): Promise<ProjectRisk> => {
    const response = await api.post('/risks', risk);
    return response.data;
  },
  
  update: async (id: number, risk: Partial<ProjectRisk>): Promise<ProjectRisk> => {
    const response = await api.put(`/risks/${id}`, risk);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/risks/${id}`);
  },
};

// Chat Message interface
export interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

// RAG API Service
export const ragAPI = {
  sendMessage: async (message: string, token: string): Promise<{ response: string }> => {
    const response = await api.post('/rag/chat', { message }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getSuggestedQuestions: async (token: string): Promise<string[]> => {
    const response = await api.get('/rag/suggestions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

// Tasks API
export const tasksApi = {
  getAllTasks: async (token: string): Promise<Task[]> => {
    const response = await api.get('/tasks', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getTasksByProject: async (projectId: number, token: string): Promise<Task[]> => {
    const response = await api.get(`/tasks/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createTask: async (task: CreateTaskRequest, token: string): Promise<Task> => {
    const response = await api.post('/tasks', task, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateTask: async (id: number, task: UpdateTaskRequest, token: string): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, task, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteTask: async (id: number, token: string): Promise<void> => {
    await api.delete(`/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
};

// Publications API
export const publicationsApi = {
  getAllPublications: async (token: string): Promise<Publication[]> => {
    const response = await api.get('/publications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return Array.isArray(response.data) ? response.data : [];
  },
  
  getPublicationsByProject: async (projectId: number, token: string): Promise<Publication[]> => {
    const response = await api.get(`/publications/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return Array.isArray(response.data) ? response.data : [];
  },
  
  createPublication: async (publication: CreatePublicationRequest, token: string): Promise<Publication> => {
    const response = await api.post('/publications', publication, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updatePublication: async (id: number, publication: UpdatePublicationRequest, token: string): Promise<Publication> => {
    const response = await api.put(`/publications/${id}`, publication, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deletePublication: async (id: number, token: string): Promise<void> => {
    await api.delete(`/publications/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
};

// Documents API
export const documentsApi = {
  getAllDocuments: async (token: string): Promise<Document[]> => {
    const response = await api.get('/documents', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getDocumentsByProject: async (projectId: number, token: string): Promise<Document[]> => {
    const response = await api.get(`/documents/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createDocument: async (document: CreateDocumentRequest, token: string): Promise<Document> => {
    const response = await api.post('/documents', document, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  uploadDocument: async (formData: FormData, token: string): Promise<Document> => {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  deleteDocument: async (id: number, token: string): Promise<void> => {
    await api.delete(`/documents/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
};

// Risks API
export const risksApi = {
  getAllRisks: async (token: string): Promise<Risk[]> => {
    const response = await api.get('/risks', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return Array.isArray(response.data) ? response.data : [];
  },
  
  getRisksByProject: async (projectId: number, token: string): Promise<Risk[]> => {
    const response = await api.get(`/risks/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return Array.isArray(response.data) ? response.data : [];
  },
  
  createRisk: async (risk: CreateRiskRequest, token: string): Promise<Risk> => {
    const response = await api.post('/risks', risk, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateRisk: async (id: number, risk: UpdateRiskRequest, token: string): Promise<Risk> => {
    const response = await api.put(`/risks/${id}`, risk, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteRisk: async (id: number, token: string): Promise<void> => {
    await api.delete(`/risks/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
};

// Analytics API
export const analyticsApi = {
  getAnalytics: async (token: string): Promise<AnalyticsData[]> => {
    const response = await api.get('/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  calculateAnalytics: async (token: string): Promise<AnalyticsData> => {
    const response = await api.post('/analytics/calculate', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getProjectAnalytics: async (projectId: number, token: string): Promise<any> => {
    const response = await api.get(`/analytics/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getDashboardData: async (token: string): Promise<any> => {
    const response = await api.get('/analytics/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getTaskAnalytics: async (projectId: number, token: string): Promise<any> => {
    const response = await api.get(`/analytics/tasks/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getBudgetAnalytics: async (projectId: number, token: string): Promise<any> => {
    const response = await api.get(`/analytics/budget/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

// Projects API with consistent naming
export const projectsApi = {
  getAllProjects: async (token: string): Promise<ResearchProject[]> => {
    const response = await api.get('/projects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getProjectById: async (id: number, token: string): Promise<ResearchProject> => {
    const response = await api.get(`/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createProject: async (project: Omit<ResearchProject, 'id'>, token: string): Promise<ResearchProject> => {
    const response = await api.post('/projects', project, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateProject: async (id: number, project: Partial<ResearchProject>, token: string): Promise<ResearchProject> => {
    const response = await api.put(`/projects/${id}`, project, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteProject: async (id: number, token: string): Promise<void> => {
    await api.delete(`/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

// Deliverables API
export const deliverablesApi = {
  getAllDeliverables: async (token: string): Promise<Deliverable[]> => {
    const response = await api.get('/deliverables', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return Array.isArray(response.data) ? response.data : [];
  },
  
  getDeliverablesByProject: async (projectId: number, token: string): Promise<Deliverable[]> => {
    const response = await api.get(`/deliverables/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return Array.isArray(response.data) ? response.data : [];
  },
  
  createDeliverable: async (deliverable: CreateDeliverableRequest, token: string): Promise<Deliverable> => {
    const response = await api.post('/deliverables', deliverable, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateDeliverable: async (id: number, deliverable: UpdateDeliverableRequest, token: string): Promise<Deliverable> => {
    const response = await api.put(`/deliverables/${id}`, deliverable, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteDeliverable: async (id: number, token: string): Promise<void> => {
    await api.delete(`/deliverables/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

// Milestones API
export const milestonesApi = {
  getAllMilestones: async (token: string): Promise<Milestone[]> => {
    const response = await api.get('/milestones', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getMilestonesByProject: async (projectId: number, token: string): Promise<Milestone[]> => {
    const response = await api.get(`/milestones/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createMilestone: async (milestone: CreateMilestoneRequest, token: string): Promise<Milestone> => {
    const response = await api.post('/milestones', milestone, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateMilestone: async (id: number, milestone: UpdateMilestoneRequest, token: string): Promise<Milestone> => {
    const response = await api.put(`/milestones/${id}`, milestone, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteMilestone: async (id: number, token: string): Promise<void> => {
    await api.delete(`/milestones/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

// Patents API
export const patentsApi = {
  getAllPatents: async (token: string): Promise<Patent[]> => {
    const response = await api.get('/patents', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return Array.isArray(response.data) ? response.data : [];
  },
  
  getPatentsByProject: async (projectId: number, token: string): Promise<Patent[]> => {
    const response = await api.get(`/patents/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return Array.isArray(response.data) ? response.data : [];
  },
  
  createPatent: async (patent: CreatePatentRequest, token: string): Promise<Patent> => {
    const response = await api.post('/patents', patent, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updatePatent: async (id: number, patent: UpdatePatentRequest, token: string): Promise<Patent> => {
    const response = await api.put(`/patents/${id}`, patent, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deletePatent: async (id: number, token: string): Promise<void> => {
    await api.delete(`/patents/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

// RAG API
export const ragApi = {
  sendMessage: async (message: string, token: string): Promise<{ response: string; sources: string[] }> => {
    const response = await api.post('/rag/chat', { message }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

// Search API
export const searchApi = {
  globalSearch: async (query: string, filters: SearchFilters, token: string): Promise<SearchResponse> => {
    const response = await api.post('/search/global', { query, filters }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default api;
