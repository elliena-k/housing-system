export function FormError({ message }: { message?: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-md border border-danger bg-danger-light px-3 py-2 text-sm text-danger-dark">
      {message}
    </div>
  );
}
