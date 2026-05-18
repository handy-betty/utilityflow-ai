import { AssistantArticle, BugReport, Member, QATestCase, Technician, TrainingDoc, WorkOrder } from "@/types";

export const members: Member[] = [
  { id: "mem-1001", name: "Dakota Ag Supply", accountNumber: "DP-1001", phone: "701-555-0145", email: "ops@dakotaag.example", address: "1420 Prairie Loop, Mandan, ND", serviceType: "Electric" },
  { id: "mem-1002", name: "Riverbend Family Clinic", accountNumber: "DP-1002", phone: "701-555-0198", email: "admin@riverbend.example", address: "88 Wellness Dr, Bismarck, ND", serviceType: "Broadband" },
  { id: "mem-1003", name: "Northern Grain Co-op", accountNumber: "DP-1003", phone: "701-555-0112", email: "maintenance@northerngrain.example", address: "403 Elevator Rd, Bismarck, ND", serviceType: "Electric" }
];

export const technicians: Technician[] = [
  { id: "tech-1", name: "Maria Jensen", specialty: "Meter / Service", phone: "701-555-0201", active: true },
  { id: "tech-2", name: "Eli Thompson", specialty: "Broadband / Fiber", phone: "701-555-0202", active: true },
  { id: "tech-3", name: "Noah Schmidt", specialty: "Outage Response", phone: "701-555-0203", active: true }
];

export const workOrders: WorkOrder[] = [
  { id: "WO-24001", memberId: "mem-1001", memberName: "Dakota Ag Supply", address: "1420 Prairie Loop, Mandan, ND", type: "Meter Issue", priority: "High", status: "Scheduled", assignedTechnicianId: "tech-1", assignedTechnicianName: "Maria Jensen", dueDate: "2026-06-02", description: "Member reports meter reading mismatch after recent storm.", notes: ["Verify meter logs before dispatch.", "Bring replacement meter if field reading fails."], createdAt: "2026-05-17" },
  { id: "WO-24002", memberId: "mem-1002", memberName: "Riverbend Family Clinic", address: "88 Wellness Dr, Bismarck, ND", type: "Service Request", priority: "Normal", status: "In Progress", assignedTechnicianId: "tech-2", assignedTechnicianName: "Eli Thompson", dueDate: "2026-06-05", description: "Broadband connection drops intermittently during office hours.", notes: ["Review signal history.", "Customer asked for morning appointment."], createdAt: "2026-05-18" },
  { id: "WO-24003", memberId: "mem-1003", memberName: "Northern Grain Co-op", address: "403 Elevator Rd, Bismarck, ND", type: "Outage", priority: "Emergency", status: "QA Review", assignedTechnicianId: "tech-3", assignedTechnicianName: "Noah Schmidt", dueDate: "2026-05-25", description: "Power interruption affecting grain handling equipment.", notes: ["Field repair completed.", "QA needs to verify notes and restoration timestamp."], createdAt: "2026-05-16" }
];

export const qaTestCases: QATestCase[] = [
  { id: "TC-001", module: "Work Orders", title: "Create emergency outage work order", steps: "Open Work Orders > Create > select Outage and Emergency > submit.", expectedResult: "New emergency work order appears in the work order list.", actualResult: "New emergency work order appears correctly.", status: "Pass", severity: "High" },
  { id: "TC-002", module: "Dispatch", title: "Move scheduled work to in progress", steps: "Open Dispatch > select Scheduled card > click Start Work.", expectedResult: "Work order moves to In Progress column.", actualResult: "Status updates on card and dashboard.", status: "Pass", severity: "Medium" },
  { id: "TC-003", module: "Assistant", title: "Assistant answers QA Review question", steps: "Ask: What does QA Review mean?", expectedResult: "Assistant explains QA Review using internal help documentation.", actualResult: "Assistant returned correct controlled answer.", status: "Pass", severity: "Low" },
  { id: "TC-004", module: "Members", title: "Prevent empty member name", steps: "Open Members > Create > leave name empty > submit.", expectedResult: "Validation message appears.", actualResult: "Not implemented in MVP.", status: "Fail", severity: "Medium" }
];

export const bugReports: BugReport[] = [
  { id: "BUG-101", title: "Member form needs required-field validation", module: "Members", stepsToReproduce: "Submit member form with blank name.", expectedResult: "System should block submission and show validation warning.", actualResult: "Form allows incomplete record in prototype.", severity: "Medium", priority: "High", status: "Open" },
  { id: "BUG-102", title: "Dispatch card needs clearer QA Review label", module: "Dispatch", stepsToReproduce: "Move completed work order to QA Review.", expectedResult: "QA Review status should be visually distinct.", actualResult: "Label is visible but could be stronger for user training.", severity: "Low", priority: "Normal", status: "In Review" }
];

export const trainingDocs: TrainingDoc[] = [
  { id: "doc-1", title: "Create a Work Order", category: "Work Orders", content: "Go to Work Orders, choose Create Work Order, select the member, set the work type, priority, due date, description, and assigned technician. Save the record and verify it appears in the dispatch workflow." },
  { id: "doc-2", title: "Dispatch Workflow", category: "Dispatch", content: "Work orders move from New to Scheduled, In Progress, Completed, QA Review, and Closed. Each status should match actual operational progress and member expectations." },
  { id: "doc-3", title: "QA Review Process", category: "Quality", content: "Completed work orders enter QA Review before closure. The reviewer confirms notes, timestamps, member communication, and completion details before closing the work order." },
  { id: "doc-4", title: "Go-Live Checklist", category: "Implementation", content: "Confirm user training, sample data, workflows, permissions, escalation contacts, support handoff, known issues, and go-live support window before release." }
];

export const assistantArticles: AssistantArticle[] = [
  { id: "a-1", question: "How do I create a work order?", answer: "Open Work Orders, select Create Work Order, choose the member, work type, priority, due date, description, and technician. Save and confirm it appears on the dispatch board.", tags: ["work orders", "create", "training"] },
  { id: "a-2", question: "What does QA Review mean?", answer: "QA Review is the final quality check after field work is marked complete. The reviewer verifies notes, timestamps, member communication, and closure readiness before the work order is closed.", tags: ["qa", "review", "status"] },
  { id: "a-3", question: "How do I assign a technician?", answer: "Open the work order, choose an active technician based on specialty and availability, then save. The assigned technician will appear on the work order card and dispatch board.", tags: ["dispatch", "technician"] },
  { id: "a-4", question: "What should we check before go-live?", answer: "Confirm training is complete, sample records are tested, permissions are set, known issues are documented, escalation contacts are available, and support handoff is ready.", tags: ["implementation", "go-live"] }
];
