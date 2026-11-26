import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchParentChildren,
  fetchParentMarks,
  fetchParentMe,
  fetchParentReportCard,
  fetchParentSubmissions,
  updateParentMe,
} from "./parentPortal";

export default function ParentDashboard({
  token: propToken,
  activeTab: propTab,
  setActiveTab: propSetTab,
}) {
  const navigate = useNavigate();
  const token =
    propToken ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("access");

  const [localTab, setLocalTab] = useState("overview");
  const activeTab = propTab || localTab;

  const [parentProfile, setParentProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone_number: "",
  });
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);

  const [term, setTerm] = useState("");
  const [year, setYear] = useState("2026");

  const [reportCard, setReportCard] = useState(null);
  const [marks, setMarks] = useState([]);
  const [submissions, setSubmissions] = useState({ assignments: [], exams: [] });

  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  const handleTabChange = (tabId) => {
    if (typeof propSetTab === "function") {
      propSetTab(tabId);
    } else {
      setLocalTab(tabId);
    }
    navigate(`/dashboard/parent/${tabId}`);
  };

  useEffect(() => {
    let active = true;
    fetchParentMe(token)
      .then((me) => {
        if (!active) return;
        setParentProfile(me);
        setProfileForm({
          full_name: me.full_name || "",
          phone_number: me.phone_number || "",
        });
        if (!me.phone_number) {
          setShowProfileEditor(true);
        }
      })
      .catch(() => {
        // Non-blocking if profile endpoint isn't needed for basic view
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    let active = true;
    setLoadingChildren(true);
    setError("");

    fetchParentChildren(token)
      .then((data) => {
        if (!active) return;
        const list = data.children || [];
        setChildren(list);
        if (list.length > 0) {
          setSelectedChildId((prev) => prev ?? list[0].id);
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load linked children.");
      })
      .finally(() => {
        if (active) setLoadingChildren(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!selectedChildId) return;
    let active = true;
    setLoadingData(true);
    setError("");

    const loadTab = async () => {
      try {
        if (activeTab === "overview" || activeTab === "report-card") {
          const data = await fetchParentReportCard(token, {
            studentId: selectedChildId,
            term: term || undefined,
            year: year || undefined,
          });
          if (active) setReportCard(data);
        } else if (activeTab === "marks") {
          const data = await fetchParentMarks(token, {
            studentId: selectedChildId,
            term: term || undefined,
            year: year || undefined,
          });
          if (active) setMarks(data.marks || []);
        } else if (activeTab === "submissions") {
          const data = await fetchParentSubmissions(token, {
            studentId: selectedChildId,
          });
          if (active) {
            setSubmissions({
              assignments: data.assignments || [],
              exams: data.exams || [],
            });
          }
        }
      } catch (err) {
        if (active) setError(err.message || "Failed to load student records.");
      } finally {
        if (active) setLoadingData(false);
      }
    };

    loadTab();
    return () => {
      active = false;
    };
  }, [token, selectedChildId, activeTab, term, year]);

  async function handleProfileSave(e) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage("");
    setProfileError("");

    try {
      const updated = await updateParentMe(token, {
        full_name: profileForm.full_name.trim(),
        phone_number: profileForm.phone_number.trim(),
      });
      setParentProfile(updated);
      setProfileForm({
        full_name: updated.full_name || "",
        phone_number: updated.phone_number || "",
      });
      setProfileMessage("Profile and WhatsApp number saved.");
    } catch (err) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  const activeChild =
    children.find((c) => c.id === Number(selectedChildId)) || null;

  const controlClass =
    "rounded-xl border border-[#c77dff]/60 bg-white px-3 py-1.5 text-sm font-medium text-[#10002b] focus:border-[#7b2cbf] focus:outline-none focus:ring-2 focus:ring-[#c77dff]/40";

  const profileCard = (
    <div className="p-4 rounded-xl border border-[#c77dff]/60 bg-white space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-medium text-[#10002b]/85 space-y-0.5">
          <p className="text-sm font-bold text-[#10002b]">
            {parentProfile?.full_name || profileForm.full_name || "Parent Account"}
          </p>
          <p>
            WhatsApp / Phone:{" "}
            <strong className="text-[#5a189a]">
              {parentProfile?.phone_number || "Not set yet"}
            </strong>
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setProfileMessage("");
            setProfileError("");
            setShowProfileEditor((prev) => !prev);
          }}
          className="px-3 py-1.5 rounded-xl border border-[#c77dff]/60 bg-[#faf5ff] text-xs font-bold text-[#5a189a] hover:bg-[#f3e8ff] cursor-pointer"
        >
          {showProfileEditor ? "Close Profile Form" : "Edit Name & WhatsApp"}
        </button>
      </div>

      {showProfileEditor && (
        <form
          onSubmit={handleProfileSave}
          className="pt-3 border-t border-[#c77dff]/30 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <div>
            <label
              htmlFor="parent-full-name"
              className="block text-xs font-bold text-[#10002b] mb-1"
            >
              Parent Full Name
            </label>
            <input
              id="parent-full-name"
              type="text"
              value={profileForm.full_name}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  full_name: e.target.value,
                }))
              }
              placeholder="e.g. Grace Wanjiku"
              className={`${controlClass} w-full`}
            />
          </div>

          <div>
            <label
              htmlFor="parent-phone-number"
              className="block text-xs font-bold text-[#10002b] mb-1"
            >
              WhatsApp / Phone Number
            </label>
            <input
              id="parent-phone-number"
              type="tel"
              value={profileForm.phone_number}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  phone_number: e.target.value,
                }))
              }
              placeholder="e.g. 0712345678 or 254712345678"
              className={`${controlClass} w-full`}
            />
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold">
              {profileError && <span className="text-red-700">{profileError}</span>}
              {profileMessage && (
                <span className="text-emerald-700">{profileMessage}</span>
              )}
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="px-4 py-2 rounded-xl bg-[#7b2cbf] text-white text-xs font-bold hover:bg-[#5a189a] disabled:opacity-60 cursor-pointer"
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  if (loadingChildren) {
    return (
      <div className="p-6 text-sm font-medium text-[#10002b]/70">
        Loading linked children...
      </div>
    );
  }

  if (error && children.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="p-4 rounded-xl border border-red-300 bg-red-50 text-sm font-medium text-red-700">
          {error}
        </div>
        {profileCard}
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4 text-[#10002b]">
        <div className="p-4 rounded-xl border border-[#c77dff]/60 bg-[#faf5ff] text-sm font-medium">
          No learners are linked to your parent account yet. Please contact the
          school administration.
        </div>
        {profileCard}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 text-[#10002b]">
      {/* Header + Child Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-[#c77dff]/60 bg-[#faf5ff]">
        <div>
          <h1 className="text-2xl font-bold text-[#10002b]">Parent Portal</h1>
          {activeChild && (
            <p className="text-xs font-medium text-[#10002b]/80 mt-1">
              Viewing{" "}
              <strong className="text-[#5a189a]">{activeChild.full_name}</strong>{" "}
              · Adm: <strong>{activeChild.admission_number}</strong> · Class:{" "}
              <strong>{activeChild.classroom_name || "Unassigned"}</strong>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="child-select"
            className="text-xs font-bold text-[#10002b]"
          >
            Select Child:
          </label>
          <select
            id="child-select"
            value={selectedChildId ?? ""}
            onChange={(e) => setSelectedChildId(Number(e.target.value))}
            className={controlClass}
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.full_name} ({child.admission_number})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Parent Name & WhatsApp Number Card */}
      {profileCard}

      {/* Navigation Tabs & Term/Year Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "overview", label: "Report Card" },
            { id: "marks", label: "Term & Exam Marks" },
            { id: "submissions", label: "Submissions & Feedback" },
          ].map((tab) => {
            const isActive =
              activeTab === tab.id ||
              (tab.id === "overview" && activeTab === "report-card");
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? "bg-[#7b2cbf] text-white shadow-sm"
                    : "border border-[#c77dff]/60 bg-[#faf5ff] text-[#10002b] hover:bg-[#f3e8ff]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {(activeTab === "overview" ||
          activeTab === "report-card" ||
          activeTab === "marks") && (
          <div className="flex items-center gap-2">
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              aria-label="Filter by term"
              className={controlClass}
            >
              <option value="">Latest Term</option>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              aria-label="Filter by year"
              placeholder="Year"
              className={`${controlClass} w-24`}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-red-300 bg-red-50 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {loadingData ? (
        <div className="p-6 rounded-xl border border-[#c77dff]/60 bg-[#faf5ff] text-sm font-medium text-[#10002b]/75">
          Loading academic records...
        </div>
      ) : activeTab === "overview" || activeTab === "report-card" ? (
        <ReportCardPanel reportCard={reportCard} />
      ) : activeTab === "marks" ? (
        <MarksPanel marks={marks} />
      ) : (
        <SubmissionsPanel submissions={submissions} />
      )}
    </div>
  );
}

function ReportCardPanel({ reportCard }) {
  if (!reportCard || !reportCard.subjects?.length) {
    return (
      <div className="p-4 rounded-xl border border-[#c77dff]/60 bg-[#faf5ff] text-sm font-medium text-[#10002b]/75">
        No report card marks recorded for the selected term/year.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-6 p-4 rounded-xl border border-[#c77dff]/60 bg-[#faf5ff] text-xs font-medium text-[#10002b]">
        <div>
          <span className="font-bold text-[#5a189a]">Term:</span>{" "}
          {reportCard.term} ({reportCard.year})
        </div>
        <div>
          <span className="font-bold text-[#5a189a]">Subjects:</span>{" "}
          {reportCard.summary?.subject_count}
        </div>
        <div>
          <span className="font-bold text-[#5a189a]">Total Marks:</span>{" "}
          {reportCard.summary?.total_marks}
        </div>
        <div>
          <span className="font-bold text-[#5a189a]">Average:</span>{" "}
          {reportCard.summary?.average_marks}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#c77dff]/60 bg-white">
        <table className="w-full text-left text-sm text-[#10002b]">
          <thead className="bg-[#faf5ff] border-b border-[#c77dff]/60 text-xs font-bold text-[#10002b]">
            <tr>
              <th className="p-3">Subject</th>
              <th className="p-3">Class</th>
              <th className="p-3">Opener</th>
              <th className="p-3">Mid Term</th>
              <th className="p-3">End Term</th>
              <th className="p-3">Marks</th>
            </tr>
          </thead>
          <tbody>
            {reportCard.subjects.map((row) => (
              <tr
                key={row.subject_code}
                className="border-b border-[#c77dff]/30 last:border-b-0 hover:bg-[#faf5ff]/60"
              >
                <td className="p-3 font-semibold">{row.subject}</td>
                <td className="p-3">{row.class_name || "-"}</td>
                <td className="p-3">{row.exams?.Opener ?? "-"}</td>
                <td className="p-3">{row.exams?.["Mid Term"] ?? "-"}</td>
                <td className="p-3">{row.exams?.["End Term"] ?? "-"}</td>
                <td className="p-3 font-bold text-[#5a189a]">{row.marks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MarksPanel({ marks }) {
  if (!marks.length) {
    return (
      <div className="p-4 rounded-xl border border-[#c77dff]/60 bg-[#faf5ff] text-sm font-medium text-[#10002b]/75">
        No individual mark entries match this filter.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#c77dff]/60 bg-white">
      <table className="w-full text-left text-sm text-[#10002b]">
        <thead className="bg-[#faf5ff] border-b border-[#c77dff]/60 text-xs font-bold text-[#10002b]">
          <tr>
            <th className="p-3">Subject</th>
            <th className="p-3">Exam Type</th>
            <th className="p-3">Term & Year</th>
            <th className="p-3">Class</th>
            <th className="p-3">Marks</th>
          </tr>
        </thead>
        <tbody>
          {marks.map((item) => (
            <tr
              key={item.id}
              className="border-b border-[#c77dff]/30 last:border-b-0 hover:bg-[#faf5ff]/60"
            >
              <td className="p-3 font-semibold">{item.subject}</td>
              <td className="p-3">{item.exam_type}</td>
              <td className="p-3">
                {item.term} {item.year}
              </td>
              <td className="p-3">{item.class_name}</td>
              <td className="p-3 font-bold text-[#5a189a]">{item.marks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubmissionsPanel({ submissions }) {
  const { assignments, exams } = submissions;

  return (
    <div className="space-y-6">
      <section className="p-4 rounded-xl border border-[#c77dff]/60 bg-[#faf5ff] space-y-3">
        <h2 className="text-sm font-bold text-[#10002b]">Assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-xs font-medium text-[#10002b]/75">
            No assignment submissions recorded.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#c77dff]/60 bg-white">
            <table className="w-full text-left text-sm text-[#10002b]">
              <thead className="bg-[#faf5ff] border-b border-[#c77dff]/60 text-xs font-bold text-[#10002b]">
                <tr>
                  <th className="p-3">Assignment</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Teacher Feedback</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-[#c77dff]/30 last:border-b-0 hover:bg-[#faf5ff]/60"
                  >
                    <td className="p-3 font-semibold">{a.assignment_title}</td>
                    <td className="p-3 font-bold text-[#5a189a]">
                      {a.grade ?? "Pending"}
                    </td>
                    <td className="p-3">{a.feedback || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="p-4 rounded-xl border border-[#c77dff]/60 bg-[#faf5ff] space-y-3">
        <h2 className="text-sm font-bold text-[#10002b]">Exams</h2>
        {exams.length === 0 ? (
          <p className="text-xs font-medium text-[#10002b]/75">
            No exam submissions recorded.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#c77dff]/60 bg-white">
            <table className="w-full text-left text-sm text-[#10002b]">
              <thead className="bg-[#faf5ff] border-b border-[#c77dff]/60 text-xs font-bold text-[#10002b]">
                <tr>
                  <th className="p-3">Exam</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Teacher Feedback</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((ex) => (
                  <tr
                    key={ex.id}
                    className="border-b border-[#c77dff]/30 last:border-b-0 hover:bg-[#faf5ff]/60"
                  >
                    <td className="p-3 font-semibold">{ex.exam_title}</td>
                    <td className="p-3 font-bold text-[#5a189a]">
                      {ex.score ?? "-"}
                    </td>
                    <td className="p-3">{ex.status}</td>
                    <td className="p-3">{ex.feedback || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}