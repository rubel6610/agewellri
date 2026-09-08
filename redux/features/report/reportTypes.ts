export interface AssessmentQuestionItem {
  id: string;
  templateId: string;
  category: "ENTRANCE_EXIT" | "HALLWAYS_WALKWAYS" | "BATHROOMS" | "LIGHTING_VISIBILITY" | "FIRE_EMERGENCY" | string;
  questionText: string;
  weight: number;
  order: number;
}

export interface AssessmentTemplateData {
  id: string;
  name: string;
  version: string;
  isActive: boolean;
  questions: AssessmentQuestionItem[];
}

export interface AssessmentResponseSubmission {
  questionId: string;
  category: string;
  questionText?: string;
  scoreValue: number; // 0, 1, or 2
  notes?: string;
  flaggedRisk?: boolean;
}

export interface SubmitAssessmentRequest {
  appointmentId: string;
  visitId?: string;
  clientId?: string;
  templateId?: string;
  responses: AssessmentResponseSubmission[];
  summary: string;
  findings?: string;
  recommendations: string;
  specialistNotes?: string;
  status?: "PENDING" | "GENERATED" | "UPLOADED" | "EMAILED";
}

export interface ReportCategoryScore {
  score: number;
  maxScore: number;
  count: number;
  items: Array<{
    questionId: string;
    score: number;
    notes?: string;
    flaggedRisk?: boolean;
  }>;
}

export interface ReportItemResponse {
  id: string;
  questionId: string;
  category: string;
  questionText: string;
  order: number;
  scoreValue: number;
  notes: string;
  flaggedRisk: boolean;
}

export interface UploadReportRequest {
  appointmentId: string;
  file: File;
  title?: string;
  summary?: string;
  notes?: string;
}

export interface ReportItem {
  id: string;
  reportId: string;
  reportNumber: string;
  appointmentId: string | null;
  visitId: string | null;
  clientId: string;
  clientNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  serviceType: string;
  visitDate: string;
  formattedVisitDate: string;
  title: string;
  reportType: string;
  status: "available" | "pending";
  reportStatus?: string;
  score?: number | null;
  maxScore?: number | null;
  percentage?: number | null;
  ratingTier?: "EXCELLENT" | "GOOD" | "MODERATE" | "ELEVATED" | string;
  summary: string;
  findings?: string;
  recommendations?: string;
  categoryScores?: Record<string, ReportCategoryScore> | null;
  responses?: ReportItemResponse[];
  specialistName: string;
  specialistTitle: string;
  specialistPhone: string;
  specialistColor: string;
  fileUrl?: string | null;
  downloadUrl?: string | null;
  previewUrl?: string | null;
  hasFile?: boolean;
  uploadedAt?: string | null;
  generatedAt: string;
  createdAt: string;
}

