export default function PermissionNotice() {
  return (
    <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
      Read-only access is active. You can view records, but create, update, and
      delete actions are disabled for this role.
    </div>
  );
}