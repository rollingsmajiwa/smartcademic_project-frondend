import { useEffect, useState } from "react";
import {
  fetchAdminParents,
  searchAdminStudents,
  updateParentChildren,
} from "../dashboards/parentPortal";

export default function AdminParentLinks({ token }) {
  const [parentQuery, setParentQuery] = useState("");
  const [parents, setParents] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState(null);

  const [studentQuery, setStudentQuery] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [admissionInput, setAdmissionInput] = useState("");

  const [loadingParents, setLoadingParents] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputClass =
    "w-full rounded-xl border border-[#c77dff]/60 bg-white px-3 py-2 text-sm text-[#10002b] placeholder:text-[#10002b]/40 focus:border-[#7b2cbf] focus:outline-none focus:ring-2 focus:ring-[#c77dff]/40";

  // Load / filter parent profiles
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setLoadingParents(true);
      fetchAdminParents(token, parentQuery)
        .then((data) => {
          if (!active) return;
          const list = Array.isArray(data) ? data : data.results || [];
          setParents(list);
          if (list.length > 0) {
            setSelectedParentId((prev) =>
              list.some((p) => p.id === prev) ? prev : list[0].id
            );
          } else {
            setSelectedParentId(null);
          }
        })
        .catch((err) => {
          if (active) setError(err.message || "Failed to load parent accounts.");
        })
        .finally(() => {
          if (active) setLoadingParents(false);
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [token, parentQuery]);

  // Search students by admission number / name / class
  useEffect(() => {
    let active = true;
    const trimmed = studentQuery.trim();
    if (!trimmed) {
      setStudentResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoadingStudents(true);
      searchAdminStudents(token, trimmed)
        .then((data) => {
          if (!active) return;
          const list = Array.isArray(data) ? data : data.results || [];
          setStudentResults(list);
        })
        .catch((err) => {
          if (active) setError(err.message || "Student search failed.");
        })
        .finally(() => {
          if (active) setLoadingStudents(false);
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [token, studentQuery]);

  const selectedParent =
    parents.find((p) => p.id === Number(selectedParentId)) || null;

  const syncUpdatedChildren = (parentId, updatedChildren) => {
    setParents((prev) =>
      prev.map((p) =>
        p.id === parentId ? { ...p, children: updatedChildren } : p
      )
    );
  };

  const handleLinkByAdmission = async (e) => {
    e.preventDefault();
    if (!selectedParent) return;

    const codes = admissionInput
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (codes.length === 0) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await updateParentChildren(token, selectedParent.id, {
        action: "add",
        admission_numbers: codes,
      });
      syncUpdatedChildren(selectedParent.id, res.children || []);
      setAdmissionInput("");
      setSuccess(`Linked ${codes.join(", ")} to ${selectedParent.full_name}.`);
    } catch (err) {
      setError(err.message || "Could not link admission number(s).");
    } finally {
      setSaving(false);
    }
  };

  const handleLinkStudentId = async (student) => {
    if (!selectedParent) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await updateParentChildren(token, selectedParent.id, {
        action: "add",
        student_ids: [student.id],
      });
      syncUpdatedChildren(selectedParent.id, res.children || []);
      setSuccess(`Linked ${student.full_name} (${student.admission_number}).`);
    } catch (err) {
      setError(err.message || "Could not link learner.");
    } finally {
      setSaving(false);
    }
  };

  const handleUnlinkStudent = async (student) => {
    if (!selectedParent) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await updateParentChildren(token, selectedParent.id, {
        action: "remove",
        student_ids: [student.id],
      });
      syncUpdatedChildren(selectedParent.id, res.children || []);
      setSuccess(`Unlinked ${student.full_name} (${student.admission_number}).`);
    } catch (err) {
      setError(err.message || "Could not unlink learner.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-5 text-[#10002b]">
      <div className="p-4 rounded-xl border border-[#c77dff]/60 bg-[#faf5ff]">
        <h2 className="text-lg font-bold text-[#10002b]">
          Parent–Learner Account Linking
        </h2>
        <p className="text-xs font-medium text-[#10002b]/75 mt-1">
          Select a parent profile and link one or more learners by admission number or search.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-red-300 bg-red-50 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl border border-[#c77dff]/60 bg-[#f3e8ff] text-xs font-semibold text-[#5a189a]">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: Parent Account Selector */}
        <div className="md:col-span-5 p-4 rounded-xl border border-[#c77dff]/60 bg-[#faf5ff] space-y-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-[#10002b]">
              Find Parent Account
            </label>
            <input
              type="text"
              value={parentQuery}
              onChange={(e) => setParentQuery(e.target.value)}
              placeholder="Search name, username, phone, or adm..."
              className={inputClass}
            />
          </div>

          {loadingParents ? (
            <p className="text-xs font-medium text-[#10002b]/70">
              Loading parent profiles...
            </p>
          ) : parents.length === 0 ? (
            <p className="text-xs font-medium text-[#10002b]/70">
              No parent accounts found.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {parents.map((parent) => {
                const isSelected = parent.id === selectedParent?.id;
                return (
                  <button
                    key={parent.id}
                    type="button"
                    onClick={() => {
                      setSelectedParentId(parent.id);
                      setError("");
                      setSuccess("");
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition ${
                      isSelected
                        ? "border-[#7b2cbf] bg-[#7b2cbf] text-white shadow-sm"
                        : "border-[#c77dff]/60 bg-white text-[#10002b] hover:bg-[#f3e8ff]"
                    }`}
                  >
                    <div className="text-sm font-bold">{parent.full_name}</div>
                    <div
                      className={`text-xs mt-0.5 ${
                        isSelected ? "text-white/85" : "text-[#10002b]/70"
                      }`}
                    >
                      @{parent.username}
                      {parent.phone_number ? ` · ${parent.phone_number}` : ""}
                    </div>
                    <div
                      className={`text-xs font-semibold mt-1 ${
                        isSelected ? "text-white" : "text-[#5a189a]"
                      }`}
                    >
                      {parent.children?.length || 0} linked learner(s)
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Linked Children & Add Controls */}
        <div className="md:col-span-7 space-y-4">
          {!selectedParent ? (
            <div className="p-4 rounded-xl border border-[#c77dff]/60 bg-[#faf5ff] text-xs font-medium text-[#10002b]/75">
              Select a parent account on the left to manage linked learners.
            </div>
          ) : (
            <>
              {/* Currently Linked Children */}
              <div className="p-4 rounded-xl border border-[#c77dff]/60 bg-[#faf5ff] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#10002b]">
                    Linked Learners for {selectedParent.full_name}
                  </h3>
                  <span className="text-xs font-semibold text-[#5a189a]">
                    {selectedParent.children?.length || 0} total
                  </span>
                </div>

                {!selectedParent.children?.length ? (
                  <p className="text-xs font-medium text-[#10002b]/70">
                    No learners linked yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedParent.children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#c77dff]/60 bg-white"
                      >
                        <div>
                          <div className="text-sm font-bold text-[#10002b]">
                            {child.full_name}
                          </div>
                          <div className="text-xs text-[#10002b]/75">
                            Adm: <strong>{child.admission_number}</strong> · Class:{" "}
                            <strong>{child.classroom_name || "Unassigned"}</strong>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => handleUnlinkStudent(child)}
                          className="px-3 py-1.5 rounded-xl border border-red-300 bg-red-50 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          Unlink
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Link by Admission Number */}
              <form
                onSubmit={handleLinkByAdmission}
                className="p-4 rounded-xl border border-[#c77dff]/60 bg-[#faf5ff] space-y-3"
              >
                <label className="block text-xs font-bold text-[#10002b]">
                  Link by Admission Number(s)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={admissionInput}
                    onChange={(e) => setAdmissionInput(e.target.value)}
                    placeholder="e.g. NGU/2026/001, NGU/2026/014"
                    className={inputClass}
                  />
                  <button
                    type="submit"
                    disabled={saving || !admissionInput.trim()}
                    className="px-4 py-2 rounded-xl bg-[#7b2cbf] text-xs font-bold text-white hover:bg-[#5a189a] disabled:opacity-50 whitespace-nowrap"
                  >
                    {saving ? "Linking..." : "Link Learner"}
                  </button>
                </div>
              </form>

              {/* Search Student Directory */}
              <div className="p-4 rounded-xl border border-[#c77dff]/60 bg-[#faf5ff] space-y-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[#10002b]">
                    Search Learner Directory
                  </label>
                  <input
                    type="text"
                    value={studentQuery}
                    onChange={(e) => setStudentQuery(e.target.value)}
                    placeholder="Type learner name, admission number, or class..."
                    className={inputClass}
                  />
                </div>

                {loadingStudents && (
                  <p className="text-xs font-medium text-[#10002b]/70">
                    Searching learners...
                  </p>
                )}

                {studentResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {studentResults.map((student) => {
                      const alreadyLinked = selectedParent.children?.some(
                        (c) => c.id === student.id
                      );
                      return (
                        <div
                          key={student.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#c77dff]/60 bg-white"
                        >
                          <div>
                            <div className="text-sm font-bold text-[#10002b]">
                              {student.full_name}
                            </div>
                            <div className="text-xs text-[#10002b]/75">
                              Adm: <strong>{student.admission_number}</strong> · Class:{" "}
                              <strong>{student.classroom_name || "Unassigned"}</strong>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={saving || alreadyLinked}
                            onClick={() => handleLinkStudentId(student)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                              alreadyLinked
                                ? "border border-[#c77dff]/60 bg-[#faf5ff] text-[#5a189a]"
                                : "bg-[#7b2cbf] text-white hover:bg-[#5a189a] disabled:opacity-50"
                            }`}
                          >
                            {alreadyLinked ? "Linked" : "Add"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}