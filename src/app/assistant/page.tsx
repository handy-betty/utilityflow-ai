"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/lib/supabaseClient";

type TrainingDoc = {
  id: string;
  category: string;
  title: string;
  content: string;
  created_at: string | null;
};

type AnswerResult = {
  title: string;
  category: string;
  answer: string;
  confidence: "High" | "Medium" | "Low" | "None";
};

const fallbackAnswer: AnswerResult = {
  title: "No matching document found",
  category: "Escalation Required",
  answer:
    "I could not find that answer in the internal training documentation. Please check the Training Docs page or escalate to a supervisor before relying on this response.",
  confidence: "None",
};

function getKeywords(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .filter(
      (word) =>
        ![
          "the",
          "and",
          "for",
          "how",
          "what",
          "when",
          "where",
          "does",
          "with",
          "from",
          "this",
          "that",
          "into",
          "then",
          "use",
          "using",
        ].includes(word)
    );
}

function findAnswer(question: string, docs: TrainingDoc[]): AnswerResult {
  if (!question.trim()) {
    return {
      title: "Ask a question",
      category: "Help",
      answer:
        "Ask a question about work orders, dispatch, QA Review, bug reports, go-live planning, or support handoff.",
      confidence: "None",
    };
  }

  if (docs.length === 0) {
    return {
      title: "No training documents available",
      category: "Training Docs",
      answer:
        "No training documents were found. Add training documents first so the assistant has controlled documentation to search from.",
      confidence: "None",
    };
  }

  const questionWords = getKeywords(question);

  const scored = docs
    .map((doc) => {
      const haystack = `${doc.category} ${doc.title} ${doc.content}`.toLowerCase();

      const score = questionWords.reduce((total, word) => {
        if (haystack.includes(word)) return total + 1;
        return total;
      }, 0);

      const titleBoost = questionWords.reduce((total, word) => {
        if (doc.title.toLowerCase().includes(word)) return total + 2;
        return total;
      }, 0);

      return {
        doc,
        score: score + titleBoost,
      };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  if (!best || best.score <= 0) {
    return fallbackAnswer;
  }

  let confidence: AnswerResult["confidence"] = "Low";

  if (best.score >= 6) confidence = "High";
  else if (best.score >= 3) confidence = "Medium";

  return {
    title: best.doc.title,
    category: best.doc.category,
    answer: best.doc.content,
    confidence,
  };
}

function confidenceClass(confidence: AnswerResult["confidence"]) {
  if (confidence === "High") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (confidence === "Medium") return "bg-blue-50 text-blue-700 border-blue-200";
  if (confidence === "Low") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function AssistantPage() {
  const [question, setQuestion] = useState("How do I create a work order?");
  const [docs, setDocs] = useState<TrainingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function loadTrainingDocs() {
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("training_docs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Load error: ${error.message}`);
      setLoading(false);
      return;
    }

    setDocs(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadTrainingDocs();
  }, []);

  const answer = useMemo(() => findAnswer(question, docs), [question, docs]);

  const suggestedQuestions = useMemo(() => {
    return docs.slice(0, 8).map((doc) => {
      if (doc.category === "Work Orders") return "How do I create a work order?";
      if (doc.category === "Dispatch") return "How do I move work through dispatch?";
      if (doc.category === "QA Testing") return "How does QA Review work?";
      if (doc.category === "Bug Reports") return "How do I submit a bug report?";
      if (doc.category === "Go-Live") return "What should we check before go-live?";
      if (doc.category === "Support") return "How does support handoff work?";
      return `What does ${doc.title} mean?`;
    });
  }, [docs]);

  async function logAssistantQuestion() {
    if (!question.trim()) return;

    await supabase.from("activity_log").insert({
      module: "AI Help",
      action: "Question Asked",
      details: `Question: ${question} | Matched: ${answer.title} | Confidence: ${answer.confidence}`,
    });

    setMessage("Question logged to activity log.");
  }

  return (
    <div>
      <PageHeader
        title="AI Help Assistant"
        subtitle="Controlled AI-help prototype that answers from Supabase training documentation and escalates unknown questions."
      />

      {message && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card p-5 xl:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Ask UtilityFlow AI
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                This assistant searches controlled Supabase training documents
                instead of making unsupported claims. It demonstrates responsible
                AI support, user training, documentation, and escalation logic.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {loading ? "Loading docs..." : `${docs.length} docs loaded`}
            </span>
          </div>

          <div className="mt-5">
            <label className="text-sm font-semibold text-slate-700">
              Question
            </label>

            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
              placeholder="Ask how to use work orders, dispatch, QA, bug reports, or go-live support."
            />
          </div>

          <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-700">
                  Assistant Answer
                </p>

                <h4 className="mt-1 text-base font-semibold text-slate-950">
                  {answer.title}
                </h4>

                <p className="mt-1 text-xs text-slate-500">
                  Source category: {answer.category}
                </p>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${confidenceClass(
                  answer.confidence
                )}`}
              >
                Confidence: {answer.confidence}
              </span>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {answer.answer}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Human-in-the-loop note: this assistant answers software-use
            questions only. Account-specific issues, outage safety, billing
            disputes, field-risk questions, or legal/compliance matters must be
            escalated to a qualified person.
          </div>

          <button
            type="button"
            onClick={logAssistantQuestion}
            className="mt-4 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Log Question to Activity
          </button>
        </section>

        <aside className="card p-5">
          <h3 className="text-lg font-semibold text-slate-950">
            Try These Questions
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            These are generated from your training documentation.
          </p>

          <div className="mt-4 space-y-2">
            {suggestedQuestions.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                No training docs available yet.
              </p>
            )}

            {suggestedQuestions.map((suggestedQuestion) => (
              <button
                key={suggestedQuestion}
                onClick={() => setQuestion(suggestedQuestion)}
                className="w-full rounded-xl bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {suggestedQuestion}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}