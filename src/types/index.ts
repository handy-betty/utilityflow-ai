export type Status = "New" | "Scheduled" | "In Progress" | "Waiting on Member" | "Completed" | "QA Review" | "Closed";
export type Priority = "Low" | "Normal" | "High" | "Emergency";

export interface Member {
  id: string;
  name: string;
  accountNumber: string;
  phone: string;
  email: string;
  address: string;
  serviceType: "Electric" | "Broadband" | "Water";
}

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  active: boolean;
}

export interface WorkOrder {
  id: string;
  memberId: string;
  memberName: string;
  address: string;
  type: "Outage" | "Meter Issue" | "Service Request" | "Install" | "Inspection" | "Repair" | "Billing Support";
  priority: Priority;
  status: Status;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  dueDate: string;
  description: string;
  notes: string[];
  createdAt: string;
}

export interface QATestCase {
  id: string;
  module: string;
  title: string;
  steps: string;
  expectedResult: string;
  actualResult: string;
  status: "Not Run" | "Pass" | "Fail" | "Blocked";
  severity: "Low" | "Medium" | "High" | "Critical";
}

export interface BugReport {
  id: string;
  title: string;
  module: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  priority: Priority;
  status: "Open" | "In Review" | "Fixed" | "Closed";
}

export interface TrainingDoc {
  id: string;
  title: string;
  category: string;
  content: string;
}

export interface AssistantArticle {
  id: string;
  question: string;
  answer: string;
  tags: string[];
}
